export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Missing code parameter');
  }

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.OAUTH_CLIENT_ID,
      client_secret: process.env.OAUTH_CLIENT_SECRET,
      code,
    }),
  });

  const data = await response.json();
  const token = data.access_token;

  if (!token) {
    return res.status(401).send(`Authentication failed: ${JSON.stringify(data)}`);
  }

  const tokenPayload = JSON.stringify({ token, provider: 'github' });

  res.send(`<!DOCTYPE html>
<html>
<body>
<script>
(function() {
  window.opener.postMessage("authorizing:github", "*");
  window.opener.postMessage(
    "authorization:github:success:${tokenPayload}",
    "*"
  );
  setTimeout(function() { window.close(); }, 500);
})();
</script>
</body>
</html>`);
}
