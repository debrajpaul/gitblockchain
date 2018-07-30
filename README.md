# Blockchain Api Interface

Following steps are necessary to get your application up and running.

What is this repository for?

    Blockchain API interface. 
 
    Version:- Blockchain_2.1
    Git clone :- https://github.com/{YOUR NAME}/gitblockchain.git

How do I get set up?

    Summary of set up:- Clone the file from repository and create an .env file.

Server Configuration:-

    MongoDB Server version: 3.6.2 (Ubuntu 16.04, link:- https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
    Node 8.11.3 software (Ubuntu 16.04, Link:- https://nodejs.org/en/)

Dependencies

    All dependencies are listed in package.json file

Database configuration:-

    Import the GenericAppBetaSchema.sql into you Database from bitbucket.
    Change the password in config.xml.

How to run tests:-

    Import the GenericApiJunitTestCase file to eclipse IDE from git clone directory.
    Run as JUnit Test or
    javac MessageUtil.java TestJunit.java [test class name]
    java [test class name]

Deployment instructions:-

    Copy all the folder in <tomcat8 path>/webapps/GenericAppBeta/GenericImage to home directory.
    Delete the both or anyone .war file depends on ui or api changes.
    Copy the .war file to <tomcat8 path>/webapps/ directory
    Copy all the image folder to newly deploy war generate directory i.e <tomcat8 path>/webapps/GenericAppBeta/GenericImage
    restart the tomcat8

Who do I talk to?

    Debraj Paul
    contact info:- pauldebraj7@gmail.com
    LinkedIn:- https://www.linkedin.com/in/debraj-paul

License
----
    GNU General Public License v3.0
