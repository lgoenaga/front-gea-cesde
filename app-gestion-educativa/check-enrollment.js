// Quick script to check enrollment data
fetch('http://localhost:8080/api/course-enrollments')
  .then(res => res.json())
  .then(data => {
    console.log('Full Response:', JSON.stringify(data, null, 2));
    if (data.data && data.data.length > 0) {
      console.log('\n\nFirst Enrollment Object:');
      console.log(JSON.stringify(data.data[0], null, 2));
    }
  })
  .catch(err => console.error('Error:', err));
