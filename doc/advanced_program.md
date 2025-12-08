Stored Procedure Code: 

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_get_recommended_cars$$

CREATE PROCEDURE sp_get_recommended_cars(
    IN p_user_id INT,
    IN p_limit INT
)
BEGIN
    DECLARE liked_count INT;
    DECLARE remaining INT;

    SELECT COUNT(*)
    INTO liked_count
    FROM Swipe
    WHERE user_id = p_user_id
      AND action = 'LIKE';

    DROP TEMPORARY TABLE IF EXISTS tmp_recommendations;

    CREATE TEMPORARY TABLE tmp_recommendations (
        car_id INT,
        listing_id INT,
        make VARCHAR(100),
        model VARCHAR(100),
        year INT,
        price DECIMAL(10,2),
        image_url VARCHAR(500),
        mpg INT
    );

    IF liked_count > 0 THEN

        DROP TEMPORARY TABLE IF EXISTS tmp_user_likes;

        CREATE TEMPORARY TABLE tmp_user_likes (
            make VARCHAR(100),
            model VARCHAR(100),
            like_count INT,
            PRIMARY KEY(make, model)
        );

        INSERT INTO tmp_user_likes (make, model, like_count)
        SELECT 
            c.make,
            c.model,
            COUNT(*)
        FROM Swipe s
        JOIN UsedCarListing u ON s.listing_id = u.listing_id
        JOIN Car c ON u.car_id = c.car_id
        WHERE s.user_id = p_user_id
          AND s.action = 'LIKE'
        GROUP BY c.make, c.model;

        INSERT INTO tmp_recommendations
        SELECT
            c.car_id,
            u.listing_id,
            c.make,
            c.model,
            c.year,
            u.price,
            i.image_url,
            c.mpg
        FROM Car c
        JOIN UsedCarListing u ON u.car_id = c.car_id
        LEFT JOIN CarImage i ON i.car_id = c.car_id
        JOIN tmp_user_likes t
          ON t.make = c.make
         AND t.model = c.model
        LEFT JOIN Swipe s
          ON s.user_id = p_user_id
         AND s.listing_id = u.listing_id
        WHERE s.listing_id IS NULL
        ORDER BY 
            t.like_count DESC,
            c.year DESC,
            u.price ASC
        LIMIT p_limit;

        DROP TEMPORARY TABLE IF EXISTS tmp_user_likes;
    END IF;

    SET remaining = p_limit - (SELECT COUNT(*) FROM tmp_recommendations);

    IF remaining > 0 THEN

        DROP TEMPORARY TABLE IF EXISTS tmp_existing_recs;

        CREATE TEMPORARY TABLE tmp_existing_recs (
            listing_id INT PRIMARY KEY
        );

        INSERT INTO tmp_existing_recs (listing_id)
        SELECT listing_id
        FROM tmp_recommendations;

        INSERT INTO tmp_recommendations
        SELECT
            c.car_id,
            u.listing_id,
            c.make,
            c.model,
            c.year,
            u.price,
            i.image_url,
            c.mpg
        FROM Car c
        JOIN UsedCarListing u ON u.car_id = c.car_id
        LEFT JOIN CarImage i ON i.car_id = c.car_id
        LEFT JOIN Swipe s
          ON s.user_id = p_user_id
         AND s.listing_id = u.listing_id
        LEFT JOIN tmp_existing_recs er
          ON er.listing_id = u.listing_id
        WHERE s.listing_id IS NULL
          AND er.listing_id IS NULL
        ORDER BY RAND()
        LIMIT remaining;

        DROP TEMPORARY TABLE IF EXISTS tmp_existing_recs;
    END IF;

    SELECT * FROM tmp_recommendations LIMIT p_limit;

    DROP TEMPORARY TABLE IF EXISTS tmp_recommendations;

END$$

DELIMITER ;

Transaction Code:
await conn.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ");
await conn.beginTransaction();

// 1) Log what we're removing (advanced query: aggregation + GROUP BY)
const [logInsert] = await conn.query(
    `
    INSERT INTO UserActionLog (user_id, removed_likes, removed_passes, removed_listings)
    SELECT 
        s.user_id,
        SUM(CASE WHEN s.action = 'LIKE' THEN 1 ELSE 0 END) AS removed_likes,
        SUM(CASE WHEN s.action = 'PASS' THEN 1 ELSE 0 END) AS removed_passes,
        COUNT(DISTINCT s.listing_id) AS removed_listings
    FROM Swipe s
    WHERE s.user_id = ?
    GROUP BY s.user_id
    `,
    [user_id]
);

// 2) Archive all this user's swipes (advanced query: multi-join INSERT...SELECT)
const [archiveResult] = await conn.query(
    `
    INSERT INTO SwipeArchive (user_id, listing_id, action, created_at, archived_at)
    SELECT 
        s.user_id,
        s.listing_id,
        s.action,
        s.created_at,
        NOW() AS archived_at
    FROM Swipe s
    JOIN UsedCarListing u ON s.listing_id = u.listing_id
    JOIN Car c ON u.car_id = c.car_id
    WHERE s.user_id = ? AND s.action = 'LIKE'
    `,
    [user_id]
);

// 3) Delete the original LIKE rows
const [deleteResult] = await conn.query(
    `DELETE FROM Swipe WHERE user_id = ? AND action = 'LIKE'`,
    [user_id]
);

await conn.commit();

res.json({
    success: true,
    log_id: logInsert.insertId,
    archived_rows: archiveResult.affectedRows,
    deleted_rows: deleteResult.affectedRows,
});
} catch (err) {
await conn.rollback();
console.error("RESET LIKES ERROR:", err);
res.status(500).json({ error: "Failed to reset likes" });

Trigger:
DELIMITER $$

CREATE TRIGGER swipe_update_timestamp
BEFORE UPDATE ON Swipe
FOR EACH ROW
BEGIN
IF NEW.action <> OLD.action 
THEN SET NEW.created_at = NOW(); 
END IF;
END$$
DELIMITER ;
