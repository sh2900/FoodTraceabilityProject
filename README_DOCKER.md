# 🐳 Docker Setup for Teammates

Welcome to TraceChain! To get the entire application running locally on your machine without installing databases or blockchains, simply use Docker.

## Prerequisites
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop)

## How to Run

1. **Start the Infrastructure**
   Open your terminal in this directory and run:
   ```bash
   docker-compose up --build
   ```
   This will automatically start:
   - MongoDB (Port 27017)
   - Ganache Blockchain (Port 7545)
   - Node.js Backend (Port 5000)
   - React Frontend (Port 3000)

2. **Deploy the Smart Contracts (First Time Only)**
   Open a *second* terminal window and deploy the smart contracts to your new local blockchain:
   ```bash
   truffle migrate --reset
   ```
   *(Note: Ganache is configured deterministically. Your private keys and contract addresses will exactly match the rest of the team.)*

3. **Update Contract Address**
   Copy the deployed `Contract Address` from the terminal output. 
   Open `docker-compose.yml` and paste it into the `CONTRACT_ADDR` field under the backend environment variables, and `REACT_APP_CONTRACT_ADDR` under the frontend.
   Restart docker-compose:
   ```bash
   docker-compose down
   docker-compose up
   ```

4. **Access the App**
   Open [http://localhost:3000](http://localhost:3000) in your browser!
