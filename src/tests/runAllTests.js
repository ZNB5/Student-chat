// Main API Test Suite Runner
import {
  APITestRunner,
  TestHealth,
  TestUserRegistration,
  TestAuthentication,
  TestUserProfile,
  ChannelTestHealth,
  TestChannelCRUD,
  ThreadsTestHealth,
  TestThreadsCRUD,
  MessagesTestHealth,
  TestMessagesCRUD,
  PresenceTestHealth,
  TestPresenceCRUD,
  SearchTestHealth,
  TestSearchFunctionalities,
  FilesTestHealth,
  ChatbotTestHealth,
  TestChatbotFunctionalities
} from './apiTestRunner';

export class MainTestRunner {
  constructor() {
    this.runner = new APITestRunner();
  }

  async runAllTests() {
    console.log("🚀 Iniciando suite de pruebas de API...\n");
    
    // Test Gateway Health
    console.log("🌐 Testing Gateway Health...");
    const healthSuite = new TestHealth(this.runner);
    const gatewayHealthResult = await healthSuite.testGatewayHealth();
    const usersHealthResult = await healthSuite.testUsersHealth();
    const channelsHealthResult = await healthSuite.testChannelsHealth();
    
    this.runner.printSummary("Gateway Health Tests", 
      [gatewayHealthResult, usersHealthResult, channelsHealthResult].filter(r => r).length, 
      3
    );
    
    // Test User Registration & Authentication
    console.log("\n👤 Testing User Registration & Authentication...");
    const registrationSuite = new TestUserRegistration(this.runner);
    const registrationResult = await registrationSuite.testRegisterUser();
    
    if (registrationResult) {
      const authSuite = new TestAuthentication(this.runner, registrationSuite);
      const authResult = await authSuite.testLogin();
      
      if (authResult) {
        const profileSuite = new TestUserProfile(this.runner);
        const getProfileResult = await profileSuite.getUserProfile();
        const updateProfileResult = await profileSuite.updateUserProfile();
        
        this.runner.printSummary("User Profile Tests", 
          [getProfileResult, updateProfileResult].filter(r => r).length, 
          2
        );
      }
      
      this.runner.printSummary("Authentication Tests", authResult ? 1 : 0, 1);
    }
    
    this.runner.printSummary("User Registration Tests", registrationResult ? 1 : 0, 1);
    
    // Test Channels
    console.log("\n💬 Testing Channels...");
    const channelHealthSuite = new ChannelTestHealth();
    const channelHealthResult = await channelHealthSuite.testHealth();
    
    if (channelHealthResult) {
      const channelCRUDSuite = new TestChannelCRUD();
      const createChannelResult = await channelCRUDSuite.testCreateChannel();
      let crudResults = [];
      
      if (createChannelResult) {
        const readResult = await channelCRUDSuite.testReadChannel();
        const listResult = await channelCRUDSuite.testListChannels();
        const updateResult = await channelCRUDSuite.testUpdateChannel();
        const removeResult = await channelCRUDSuite.testRemoveChannel();
        
        crudResults = [readResult, listResult, updateResult, removeResult];
      }
      
      this.runner.printSummary("Channel CRUD Tests", 
        [createChannelResult, ...crudResults].filter(r => r).length, 
        5  // create + 4 CRUD operations
      );
    }
    
    this.runner.printSummary("Channel Health Tests", channelHealthResult ? 1 : 0, 1);
    
    // Test Threads
    console.log("\n🧵 Testing Threads...");
    const threadsHealthSuite = new ThreadsTestHealth();
    const threadsHealthResult = await threadsHealthSuite.testHealth();
    
    if (threadsHealthResult) {
      const threadsCRUDSuite = new TestThreadsCRUD();
      const createThreadResult = await threadsCRUDSuite.testCreateThread();
      let threadCrudResults = [];
      
      if (createThreadResult) {
        const readResult = await threadsCRUDSuite.testReadThread();
        const updateResult = await threadsCRUDSuite.testUpdateThread();
        
        threadCrudResults = [readResult, updateResult];
      }
      
      this.runner.printSummary("Threads CRUD Tests", 
        [createThreadResult, ...threadCrudResults].filter(r => r).length, 
        3  // create + read + update
      );
    }
    
    this.runner.printSummary("Threads Health Tests", threadsHealthResult ? 1 : 0, 1);
    
    // Test Messages
    console.log("\n💬 Testing Messages...");
    const messagesHealthSuite = new MessagesTestHealth();
    const messagesHealthResult = await messagesHealthSuite.testHealth();
    
    if (messagesHealthResult) {
      const messagesCRUDSuite = new TestMessagesCRUD();
      const listMessagesResult = await messagesCRUDSuite.testListMessages();
      const createMessageResult = await messagesCRUDSuite.testCreateMessage();
      let messageCrudResults = [];
      
      if (createMessageResult) {
        const updateResult = await messagesCRUDSuite.testUpdateMessage();
        const deleteResult = await messagesCRUDSuite.testDeleteMessage();
        
        messageCrudResults = [updateResult, deleteResult];
      }
      
      this.runner.printSummary("Messages CRUD Tests", 
        [listMessagesResult, createMessageResult, ...messageCrudResults].filter(r => r).length, 
        4  // list + create + update + delete
      );
    }
    
    this.runner.printSummary("Messages Health Tests", messagesHealthResult ? 1 : 0, 1);
    
    // Test Presence
    console.log("\n👤 Testing Presence...");
    const presenceHealthSuite = new PresenceTestHealth();
    const presenceHealthResult = await presenceHealthSuite.testHealth();
    
    if (presenceHealthResult) {
      const presenceCRUDSuite = new TestPresenceCRUD();
      const createResult = await presenceCRUDSuite.testCreatePresence();
      const getResult = await presenceCRUDSuite.testGetUserPresence();
      const updateResult = await presenceCRUDSuite.testUpdatePresence();
      const deleteResult = await presenceCRUDSuite.testDeletePresence();
      
      this.runner.printSummary("Presence CRUD Tests", 
        [createResult, getResult, updateResult, deleteResult].filter(r => r).length, 
        4
      );
    }
    
    this.runner.printSummary("Presence Health Tests", presenceHealthResult ? 1 : 0, 1);
    
    // Test Search
    console.log("\n🔍 Testing Search...");
    const searchHealthSuite = new SearchTestHealth();
    const searchHealthResult = await searchHealthSuite.testHealth();
    
    if (searchHealthResult) {
      const searchFunctionalitiesSuite = new TestSearchFunctionalities();
      const searchMessagesResult = await searchFunctionalitiesSuite.testSearchMessages();
      const searchChannelsResult = await searchFunctionalitiesSuite.testSearchChannels();
      
      this.runner.printSummary("Search Functionalities Tests", 
        [searchMessagesResult, searchChannelsResult].filter(r => r).length, 
        2
      );
    }
    
    this.runner.printSummary("Search Health Tests", searchHealthResult ? 1 : 0, 1);
    
    // Test Files (Health only for now)
    console.log("\n📁 Testing Files...");
    const filesHealthSuite = new FilesTestHealth();
    const filesHealthResult = await filesHealthSuite.testHealth();
    this.runner.printSummary("Files Health Tests", filesHealthResult ? 1 : 0, 1);
    
    // Test Chatbot
    console.log("\n🤖 Testing Chatbot...");
    const chatbotHealthSuite = new ChatbotTestHealth();
    const chatbotHealthResult = await chatbotHealthSuite.testHealth();
    
    if (chatbotHealthResult) {
      const chatbotFunctionalitiesSuite = new TestChatbotFunctionalities();
      const chatResult = await chatbotFunctionalitiesSuite.testChatWithBot();
      
      this.runner.printSummary("Chatbot Functionalities Tests", chatResult ? 1 : 0, 1);
    }
    
    this.runner.printSummary("Chatbot Health Tests", chatbotHealthResult ? 1 : 0, 1);
    
    // Print final summary
    console.log("\n" + "=".repeat(50));
    console.log(`📊 Resumen Final:`);
    console.log(`   Total Tests: ${this.runner.totalTests}`);
    console.log(`   Passed: ${this.runner.passedTests}`);
    console.log(`   Failed: ${this.runner.failedTests}`);
    console.log(`   Skipped: ${this.runner.skippedTests}`);
    console.log("=".repeat(50));
    
    return {
      total: this.runner.totalTests,
      passed: this.runner.passedTests,
      failed: this.runner.failedTests,
      skipped: this.runner.skippedTests,
      success: this.runner.failedTests === 0
    };
  }
}

// Function to run tests
export const runAllApiTests = async () => {
  const testRunner = new MainTestRunner();
  return await testRunner.runAllTests();
};

// Run tests if called directly
if (typeof window !== 'undefined' && window.location.href.includes('test')) {
  // Only run automatically if in test mode
  console.log("Running API tests...");
  runAllApiTests();
}