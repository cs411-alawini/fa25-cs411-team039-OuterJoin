User info:

When the frontend first renders, you are prompted to enter in a username and password combination. If this combination exists in the users database, it will log you in to that account. if the combination doesn't exist, it will create a user in the database and log in you into that account.

After you are logged in, the following state variables are set on the frontend:
  const [username, setUsername] = useState(null);
  const [userId, setUserId] = useState(0);

The username is assigned from whatever the user signed in with, and the userID is what the database call returns from whatever values the user entered to login. This userID is the primary key of our "User" database, so it will be used for creating preference and swipe entities.