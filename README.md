**Specification Deliverable**  
---

**Elevator Pitch**

Are you tired of your friends beating you at complicated games like Chess and Checkers? Try Tic-Tac-Toe instead\! There are no complicated rules to learn as a barrier to entry, and with this new online Tic-Tac-Toe application you can challenge and beat your friends faster than ever. Simply create a username, login, search for your friends on the app and start having fun in no time.

**Design**

![alt text](tic_tac_toe_wireframe-1.png)

**Key Features**

* Secure login over HTTPS  
* Search friends by username  
* Play online with friends  
* Best of 1, best of 2, best of 3 game modes  
* Score displayed in real time  
* Game win/loss history stored

**Technologies**

I am going to use the required technologies in the following ways.

* HTML \- I will use HTML to create clean, clear application design. I will create a login page, a friend search page, a game page with score tracking, and a win loss history page.  
* CSS \- I will use CSS to make my application appealing, user friendly, and eye-catching.  
* React \- I will use react to organize a user interface that is easy to use and intuitive.  
* Service \- I will create an API that will be used for:  
  * Logins  
  * Sending and receiving friend requests  
  * Sending and receiving in game messages  
* DB/Login \- I will store game win/loss data in a database along with usernames and login information.  
* WebSocket \- I will use these to transfer real time moves from client to client machine.

**HTML deliverable**

**Prerequisites**

* I completed all of the prerequisites i.e. Simon deployed to my production environment, added a link to my gitHub repo at the bottom of each page. I have done regular Git commits to show my work history.

**HTML pages**

* index.html  \- Login page for users to enter a username and password  
* play.html \- Main game page to play Tic-Tac-Toe  
* friends.html \- Page to search and invite friends  
* win-loss.html \- Page with win/loss data

**Proper HTML element use**

* Used html elements across all pages including header, nav, main, section, footer, form, and table  
* There is consistent navigation across pages

**Link navigation**

* Navigation bar at the top of page includes links to all pages  
* The login form routes players to the main game page  
* Includes buttons to navigate between friends and gameplay features

**Text**

* Text describes application functionality, and game modes  
* Pages contain text explaining future functionality

**3rd-party API placeholders**

* Friends page has placeholder for a REST API to retrieve friend data  
* Win/loss page includes placeholder for REST API to retrieve win/loss stats

**Images**

* Game page includes images for the Tic-Tac-Toe board and pictures for X or O options

**Database and login placeholders**

* Username and password input area with submit button  
* Win/loss and friends pages contain mock datasets representing stored records

**WebSocket Placeholder**

* Game page includes a websocket placeholder to show where realtime websocket information will be received


**CSS deliverable**

* I have completed all of the prerequisites:  
  * Simon CSS deployed to my production environment  
  * Link to my Github repo prominently displayed on footer of every page  
  * Full git commit history  
* The layout is visually appealing:  
  * Good coloration  
  * No overflowing elements  
* Used CSS framework  
  * I used bootstrap  
* All visual elements are styled using CSS  
* Responsive to different window sizes:  
  * I used full screen and iphone xr to test resizing, and they both look good  
* Used Roboto imported font  
* Used different types of selectors:  
  * Element  
  * Class  
  * Id  
  * Pseudo