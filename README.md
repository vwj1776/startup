# GreyhoundWriting

[My Notes](notes.md)

A writing platform designed for writers and readers to publish and review eachothers work. 

> [!NOTE]
> What does one snowman say to the other? <br>
> ʇsoɹɹɐɔ ǝʞᴉl sllǝɯs ʇᴉ <br>

> [!NOTE]
>  For markdown [documentation](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)

## 🚀 Specification Deliverable

> [!NOTE]
>  Example [example](https://github.com/webprogramming260/startup-example/blob/main/README.md) for inspiration.

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [X] Proper use of Markdown
- [X] A concise and compelling elevator pitch
- [X] Description of key features
- [X] Description of how you will use each technology
- [X] One or more rough sketches of your application. Images must be embedded in this file using Markdown image references.

### Elevator pitch

Greyhound Writing is a platform designed for young writers to easily publish and get feedback to improve their writing to help them reach their maximum potential as authors. (Older authors can participate as well.) Few advertisements are used to make money, which is primarily given to the authors. It is sort of designed as a way for a school writing club to publish the short stories they write and make a little money off of it. It can also be used for journalism, nonfiction or stories, anything the writer wishes.
### Design

![logoPage1](startupDesign/logoP1.png)
![storiesPage2](startupDesign/storiesP2.png)
![singleStoryPage3](startupDesign/singleStoryP3.png)
<!-- ![messagesPage4](startupDesign/messagesP4.png) -->
![accountPage5](startupDesign/accountP5.png)


The authorUser uploads a story, which the Website saves to the Database. A readerUser accesses the website, first requesting a list of all stories from the database and then selecting a specific story to read. When the reader writes a comment on the story, the interaction uses a WebSocket connection to send the comment to the website in real-time. The Website saves the comment to the DB and retrieves updated comments with the same WebSocket channel, ensuring that the reader sees live updates.

```mermaid
sequenceDiagram
    actor authorUser
    actor Website
    actor Database
    authorUser->>Website: uploads story to the website
    Website->>Database: uploads story to the DB
```
```mermaid
sequenceDiagram
    actor readerUser
    actor Website
    actor Database
    readerUser->>Website: opens page
    Website->>Database: asks for list of all stories
    Database->>Website: gives list of all stories
    readerUser->>Website: opens a story
    Website->>Database: asks for the story
    Database->>Website: gives the story
    readerUser->>Website: writes comment on story(websocket)
    Database->>Website: gives comments on story(websocket)
    Website->>Database: uploads comment to DB

```

### Key features

- Options for new users to view and read different stories published by other authors.
- Ways for users to comment and give public or private feedback to the authors.
- A messaging board
- A home page for authors with accounts where they can upload new stories and view feedback.

### Technologies

I am going to use the required technologies in the following ways.

- **HTML** - Design and layout the website, putting in the necessary boxes, text, and blueprints.
- **CSS** - Fill in the details and color of the website. 
- **React** - There will be an upload story, buttons for navigation, it would be nice to emplement a little filter for bad language in the reviews. 
- **Service** - Endpoints are as follows:
    - get stories
    - delete story, for the author only
    - add story
    - get comments (websocket)
    - add comments (websocket)
    - get users
    - add users
    - add conversation (websocket, if possible)
    - get conversation (websocket, if possible)
    - add message (websocket, if possible)
    - get messages (websocket, if possible)

- **DB/Login** - stores the authors/readers/users, their stories, each stories' reviews. Contains all authentication needed, such as only valid users can make, view, and review stories. 
- **WebSocket** - The comments/reviews will be the websocket. If we have extra time or that doesn't work then we can add messaging.   

## 🚀 AWS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [X] **Server deployed and accessible with custom domain name** - [My server link](https://greyhoundwriting.click).

## 🚀 HTML deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [X] **HTML pages** - added HTML pages including `authorAccount.html`, `demo.html`, `1ststory.html`, `manyStories.html`, and `index.html` to structure the web application.
- [X] **Proper HTML element usage** - Used HTML elements such as `<nav>`, `<main>`, `<form>`, and `<div>` 
- [X] **Links** - Added navigation links between pages and to the GitHub repository.
- [X] **Text** - added text elements to display information about stories, authors, and login details.
- [X] **3rd party API placeholder** - stubbed out a 3rd party API to enhance functionality.
- [X] **Images** - Added images such as profile pictures and an attemted page turn animation.
- [X] **Login placeholder** - login form in `index.html` to display the author's account name.
- [X] **DB data placeholder** - Placeholder for database functionality to store and retrieve data.
- [X] **WebSocket placeholder** - Placeholder for WebSocket functionality for comments and messages.

## 🚀 CSS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Header, footer, and main content body** - I completed this part of the deliverable.
- [x] **Navigation elements** - I  completed this part of the deliverable.
- [x] **Responsive to window resizing** - I completed this part of the deliverable. Added a meta tag.
- [x] **Application elements** - I completed this part of the deliverable.
- [x] **Application text content** - I completed this part of the deliverable.
- [x] **Application images** - I completed this part of the deliverable.

## 🚀 React part 1: Routing deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Bundled using Vite** - I completed this part of the deliverable. we used vite to tell the backend which port (localhost:3000) to connect to.
- [x] **Components** - I completed this part of the deliverable.
- [x] **Router** - Routing between login and different pages.

## 🚀 React part 2: Reactivity

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **All functionality implemented or mocked out** - I completed this part of the deliverable.
- [x] **Hooks** - I completed this part of the deliverable.

## 🚀 Service deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Node.js/Express HTTP service** - I completed this part of the deliverable.
- [x] **Static middleware for frontend** - I completed this part of the deliverable.
- [x] **Calls to third party endpoints** - I completed this part of the deliverable.
- [x] **Backend service endpoints** - I completed this part of the deliverable.
- [x] **Frontend calls service endpoints** - I completed this part of the deliverable.

## 🚀 DB/Login deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **User registration** - I completed this part of the deliverable. Authors create accounts to be able to view other stories and post stories. You can't do anything else except for view the repository if you don't have an account.
- [x] **User login and logout** - I completed this part of the deliverable. The logout button is included on the navlinks and they can sign out and sign back in once an account is made.
- [ ] **Stores data in MongoDB** - I did not complete this part of the deliverable.
- [ ] **Stores credentials in MongoDB** - I did not complete this part of the deliverable.
- [ ] **Restricts functionality based on authentication** - I did not complete this part of the deliverable.

## 🚀 WebSocket deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Backend listens for WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Frontend makes WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Data sent over WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **WebSocket data displayed** - I did not complete this part of the deliverable.
- [ ] **Application is fully functional** - I did not complete this part of the deliverable.
