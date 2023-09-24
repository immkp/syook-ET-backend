# Encrypted Time-Series Backend Application

This backend application generates and emits encrypted data streams over a socket, listens to incoming data streams, decrypts and decodes them, and saves the data to a time-series MongoDB database. The saved data is then emitted to a frontend application in real-time.

## Table of Contents
- [Installation](#Installation)
- [Getting Started](#GettingStarted)
- [Deployment Link](#DeploymentLink)

## Installation

1. Clone the repository:

   ```shell
   git clone https://github.com/immkp/syook-ET-backend.git
   ```

## Getting Started

To get started with this project, follow these steps:


1. Install the required dependencies:
    ```shell
    npm install
    ```

2. Start the server:
    ```shell
    npm run dev
    ```

These prerequisites and steps will help you set up and run the project successfully. 

Dont forget to change the Database URL and client URL for successfully running in the local machine.


## Deployment Link

https://syook-et.onrender.com/
