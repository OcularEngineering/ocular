import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // Specify the path to your JSON file
  const filePath = path.join(process.cwd(), 'data/users.json');

  // Read the file synchronously (you could use async as well)
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error reading the users data' });
    }

    // Parse the JSON data and return it
    const users = JSON.parse(data);
    res.status(200).json(users);
  });
}
