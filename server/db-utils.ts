// This file contains shared utilities and state for database connection
export let isMongoDbConnected = false;

// Function to set MongoDB connection state
export function setMongoDbConnected(value: boolean): void {
  isMongoDbConnected = value;
}