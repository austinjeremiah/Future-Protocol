// Debug script to test IPFS upload and retrieval flow
// This will help us understand if the problem is in upload, storage, or retrieval

console.log("🚀 IPFS Flow Debug Test");
console.log("=".repeat(50));

// Simulate file upload test
function simulateFileUpload() {
  console.log("\n📤 STEP 1: File Upload Simulation");
  console.log("-".repeat(30));
  
  // Create a test file blob
  const testContent = "This is a test PDF file content";
  const testBlob = new Blob([testContent], { type: 'application/pdf' });
  const testFile = new File([testBlob], 'test-document.pdf', { type: 'application/pdf' });
  
  console.log(`📁 Test File Created:`);
  console.log(`   Name: ${testFile.name}`);
  console.log(`   Size: ${testFile.size} bytes`);
  console.log(`   Type: ${testFile.type}`);
  
  return testFile;
}

// Test IPFS retrieval
async function testIPFSRetrieval(cid) {
  console.log("\n📥 STEP 2: IPFS Retrieval Test");
  console.log("-".repeat(30));
  
  const testUrls = [
    `https://gateway.lighthouse.storage/ipfs/${cid}`,
    `https://ipfs.io/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
    `https://dweb.link/ipfs/${cid}`
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`🔗 Testing: ${url}`);
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`   Status: ${response.status} ${response.statusText}`);
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');
        console.log(`   ✅ Success! Content-Type: ${contentType}, Size: ${contentLength}`);
        return url;
      }
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
  }
  
  console.log(`❌ All gateway tests failed for CID: ${cid}`);
  return null;
}

// Test the complete flow
async function testCompleteFlow() {
  console.log("\n🧪 COMPLETE FLOW TEST");
  console.log("=".repeat(50));
  
  // Test known working CIDs
  const testCIDs = [
    "QmNR2n4zywCV61MeMLB6JwPueAPqheqpfiA4fLPMxouEmQ", // Example CID
    "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"  // Another example
  ];
  
  for (const cid of testCIDs) {
    console.log(`\n🔍 Testing CID: ${cid}`);
    await testIPFSRetrieval(cid);
  }
}

// Instructions for manual testing
function showInstructions() {
  console.log("\n📋 MANUAL TESTING INSTRUCTIONS");
  console.log("=".repeat(50));
  console.log("1. Upload a file using the web interface");
  console.log("2. Note the IPFS CID from console logs");
  console.log("3. Test the CID in browser:");
  console.log("   - https://gateway.lighthouse.storage/ipfs/YOUR_CID");
  console.log("   - https://ipfs.io/ipfs/YOUR_CID");
  console.log("4. Compare the downloaded file with original");
  console.log("\n🎯 Key Questions:");
  console.log("   - Does the CID work in browser?");
  console.log("   - Is the downloaded file the same as uploaded?");
  console.log("   - Is the content-type correct?");
}

// Run the test
console.log("Starting IPFS flow debug test...");
const testFile = simulateFileUpload();
testCompleteFlow();
showInstructions();

console.log("\n🔚 Debug test completed. Check console for results.");