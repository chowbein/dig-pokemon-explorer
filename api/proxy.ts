import type { VercelRequest, VercelResponse } from '@vercel/node';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Extract the path and query parameters from the incoming request
    const path = req.url || '';
    
    // Construct the full URL to the PokeAPI
    const pokeApiUrl = `${POKEAPI_BASE_URL}${path.replace('/api', '')}`;

    // Forward the request to the PokeAPI
    const apiResponse = await fetch(pokeApiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PokemonExplorer/1.0',
      },
    });

    if (!apiResponse.ok) {
      // If the API returns an error, forward the status and message
      res.status(apiResponse.status).send(await apiResponse.text());
      return;
    }

    const data = await apiResponse.json();

    // Set cache headers for the Vercel Edge Network
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); // Cache for 1 day

    // Send the successful response back to the client
    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).send('Internal Server Error');
  }
}
