export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Missing code parameter');
  }

  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).send(`Env vars ausentes — clientId: ${!!clientId}, clientSecret: ${!!clientSecret}`);
  }

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  const data = await response.json();
  const token = data.access_token;

  if (!token) {
    return res.status(401).send(`Authentication failed: ${JSON.stringify(data)}`);
  }

  const tokenData = JSON.stringify({ token, provider: 'github' });

  res.send(`<!DOCTYPE html>
<html>
<body>
<script>
(function() {
  var data = ${JSON.stringify(tokenData)};
  window.opener.postMessage("authorizing:github", "*");
  window.opener.postMessage("authorization:github:success:" + data, "*");
  setTimeout(function() { window.close(); }, 500);
})();
</script>
</body>
</html>`);
}
