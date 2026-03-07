// Society Integration Validation Script
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Society Integration...\n');

// Check if required files exist
const requiredFiles = [
  'app/api/societies.ts',
  'app/screens/societies/SocietiesScreen.tsx',
  'app/screens/CreateSocietyScreen.tsx',
  'app/screens/PostScreen.tsx',
  'server/src/routes/societies.ts',
  'server/src/routes/createSociety.ts'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
});

// Check API functions
const societiesApiPath = path.join(__dirname, 'app/api/societies.ts');
if (fs.existsSync(societiesApiPath)) {
  const content = fs.readFileSync(societiesApiPath, 'utf8');
  const requiredFunctions = [
    'getSocieties',
    'getJoinedSocieties', 
    'getUserSocieties',
    'discoverSocieties',
    'joinSociety',
    'leaveSociety',
    'createSociety',
    'getSocietyConfessions'
  ];
  
  console.log('\n🔍 Checking API functions...');
  requiredFunctions.forEach(func => {
    if (content.includes(`export const ${func}`)) {
      console.log(`✅ ${func} function exists`);
    } else {
      console.log(`❌ ${func} function missing`);
      allFilesExist = false;
    }
  });
}

// Check backend routes
const societiesRoutePath = path.join(__dirname, 'server/src/routes/societies.ts');
if (fs.existsSync(societiesRoutePath)) {
  const content = fs.readFileSync(societiesRoutePath, 'utf8');
  const requiredRoutes = [
    'router.get(\'/\'',
    'router.get(\'/discover\'',
    'router.get(\'/joined\'',
    'router.get(\'/you\'',
    'router.post(\'/join/:id\'',
    'router.post(\'/leave\''
  ];
  
  console.log('\n🔍 Checking backend routes...');
  requiredRoutes.forEach(route => {
    if (content.includes(route)) {
      console.log(`✅ ${route} route exists`);
    } else {
      console.log(`❌ ${route} route missing`);
      allFilesExist = false;
    }
  });
}

// Check frontend integration
const societiesScreenPath = path.join(__dirname, 'app/screens/societies/SocietiesScreen.tsx');
if (fs.existsSync(societiesScreenPath)) {
  const content = fs.readFileSync(societiesScreenPath, 'utf8');
  const requiredImports = [
    'getJoinedSocieties',
    'joinSociety',
    'leaveSociety'
  ];
  
  console.log('\n🔍 Checking frontend integration...');
  requiredImports.forEach(imp => {
    if (content.includes(imp)) {
      console.log(`✅ ${imp} imported in SocietiesScreen`);
    } else {
      console.log(`❌ ${imp} not imported in SocietiesScreen`);
      allFilesExist = false;
    }
  });
}

// Check PostScreen integration
const postScreenPath = path.join(__dirname, 'app/screens/PostScreen.tsx');
if (fs.existsSync(postScreenPath)) {
  const content = fs.readFileSync(postScreenPath, 'utf8');
  const requiredFeatures = [
    'selectedSociety',
    'showSocietyModal',
    'getJoinedSocieties',
    'societyId: selectedSociety?.id'
  ];
  
  console.log('\n🔍 Checking PostScreen society integration...');
  requiredFeatures.forEach(feature => {
    if (content.includes(feature)) {
      console.log(`✅ ${feature} implemented in PostScreen`);
    } else {
      console.log(`❌ ${feature} missing in PostScreen`);
      allFilesExist = false;
    }
  });
}

console.log('\n📋 Summary:');
if (allFilesExist) {
  console.log('✅ All society integration components are properly implemented!');
  console.log('🚀 Ready to test the complete society flow');
} else {
  console.log('❌ Some components are missing. Please review the errors above.');
}

console.log('\n📝 Next Steps:');
console.log('1. Start the backend server: cd server && npm start');
console.log('2. Start the frontend: npm start');
console.log('3. Test the complete society flow using the test plan');
console.log('4. Verify all API endpoints are working correctly');
