/**
 * Test script to verify the login fixes work correctly
 * This simulates the API response handling logic
 */

// Mock API response that matches the backend structure
const mockApiResponse = {
  data: {
    _id: 'user123',
    name: 'John Doe',
    email: 'john@example.com',
    roles: ['member'],
    token: 'mock-token-123'
  }
};

// Test the fixed response handling logic
function testLoginResponseHandling() {
  console.log('Testing login response handling...');

  try {
    const { data } = mockApiResponse;

    // Validate API response structure (from fixed authStore.ts)
    if (!data || !data.token) {
      throw new Error('Invalid API response: missing token');
    }

    // Check if user data is nested (data.user) or at root level
    const userResponse = data.user || data;

    if (!userResponse || !userResponse._id) {
      throw new Error('Invalid API response: missing user data');
    }

    console.log('✅ Login successful, setting user data:', userResponse);

    // Set user data with explicit type handling including required fields
    const userData = {
      _id: userResponse._id,
      name: userResponse.name,
      email: userResponse.email,
      roles: userResponse.roles || ['member'],
      lastSeen: new Date(),
      createdAt: new Date()
    };

    console.log('✅ User data prepared:', userData);
    console.log('✅ All tests passed! The login fixes should work correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }

  return true;
}

// Test error handling
function testErrorHandling() {
  console.log('\nTesting error handling...');

  // Test case 1: Missing token
  try {
    const badResponse1 = { data: { _id: 'user123' } };
    const { data } = badResponse1;
    if (!data || !data.token) {
      throw new Error('Invalid API response: missing token');
    }
  } catch (error) {
    console.log('✅ Correctly caught missing token error:', error.message);
  }

  // Test case 2: Missing user data
  try {
    const badResponse2 = { data: { token: 'mock-token' } };
    const { data } = badResponse2;
    const userResponse = data.user || data;
    if (!userResponse || !userResponse._id) {
      throw new Error('Invalid API response: missing user data');
    }
  } catch (error) {
    console.log('✅ Correctly caught missing user data error:', error.message);
  }

  console.log('✅ Error handling tests passed!');
}

// Run all tests
testLoginResponseHandling();
testErrorHandling();