import express from 'express';
import axios from 'axios'
import responseTime from 'response-time';
import { createClient } from 'redis';

const app = express();

// Create redis client
const client = createClient()

// Middleware to measure response time
app.use(responseTime());

// Route to fetch Naruto characters
app.get('/characters', async (req, res) => {

  const cacheResults = await client.get('characters');
  if (cacheResults) return res.json(JSON.parse(cacheResults));

  
  const { data } = await axios.get('https://dattebayo-api.onrender.com/characters');

  const savedResults = await client.set('characters', JSON.stringify(data));
  console.log('savedResults', savedResults);
  

  res.json(data);
})


// Route to fetch Naruto characters by ID
app.get('/characters/:id', async (req, res) => {

  const { id } = req.params;

  const cacheResults = await client.get(`character-${id}`);
  if (cacheResults) return res.json(JSON.parse(cacheResults));

  const { data } = await axios.get('https://dattebayo-api.onrender.com/characters/' + id);

  const savedResults = await client.set(`character-${id}`, JSON.stringify(data));
  console.log('savedResults', savedResults);

  return res.json(data);

});


const main = async () => {
  client.on('error', err => console.log('Redis Client Error', err));
  await client.connect();


  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  })
}

main()