# Crane, a Social Media Application.

### About:

Crane is a social media application that allows users to craft posts, join flocks and interact with one another. My inspirations for crane's functionality came from reddit and facebook.

Some Terminology:
- Flock(s) - Group(s)
- Wing(s) - upvotes and downvotes.

## Deployed Link:

Crane is Deployed on heroku at https://crane-jw42.herokuapp.com/

## Getting Started For This Repo:

1. Install all dependancies:

After forking and cloning this repo, run
```
npm install
```
2. Setup your database:

This repo heavily relies postgres as it's database, and others could cause unintened errors at this moment.

Regardless, you need to create the databse, for this example I'll create the one named from the repo's config json.
```
db:create crane_development
```

3. Setup sequelize

Sequelize cli should be installed as a dependancy so we can run:
```
sequelize db:migrate
```

4. Lastly, Start the server:

```
npm start
```

## Some Notes:

- As of right now, some features are incomplete if you were to look at the planning markdown file. I work on this project in spare time and I'll try to add more of these features over time!