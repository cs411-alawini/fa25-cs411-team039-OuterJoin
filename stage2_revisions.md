Comments
-0.5: The UML diagram is not located in the doc folder

-1: A car can have multiple car images, but the UML diagram shows that this is a 1-1 relationship

-1: It should involve at least two types of relationships (i.e., 1-1, 1-many, and many-many) but there is only 1-many relationship in your design

-1: UML diagram shouldn't have FKs that represent relations

-1: Extra FDs (e.g. body_style in NewCarPrice)

Changes:
-Moved UML diagram to doc folder
-In our implementation we intend to have exactly one canonical image for each car, so we believe this should be a 1-1 relationship
-Assuming the car-car_image relationship is 1-1 then we should satisfy the number of relationships requirement
-We have edited our PT1-Stage 2.pdf file to remove the extra functional dependencies