
const targetUrl = 'https://archive.org/download/ps1-rip-chd-ck/Metal%20Gear%20Solid%20-%20VR%20Missions.chd';
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://archive.org/',
};

async function test() {
  try {
    const response = await fetch(targetUrl, { 
      method: 'GET',
      headers,
      redirect: 'follow'
    });
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', JSON.stringify([...response.headers.entries()]));
    if (response.status === 401) {
      console.log('WWW-Authenticate:', response.headers.get('www-authenticate'));
    }
  } catch (e) {
    console.error(e);
  }
}

test();
