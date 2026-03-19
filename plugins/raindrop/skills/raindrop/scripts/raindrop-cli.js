#!/usr/bin/env node

const axios = require('axios');
const { program } = require('commander');

const API_BASE = 'https://api.raindrop.io/rest/v1';
const TOKEN = process.env.RAINDROP_TOKEN;

if (!TOKEN) {
  console.error('Error: RAINDROP_TOKEN environment variable is not set.');
  process.exit(1);
}

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// Helper to get collection ID by name
async function getCollectionIdByName(name) {
  if (!name) return 0; // Default to "All"
  if (/^\d+$/.test(name)) return parseInt(name); // It's an ID

  const res = await client.get('/collections');
  const collections = res.data.items;
  
  // Also check child collections
  const resChildren = await client.get('/collections/childrens');
  const allCollections = [...collections, ...resChildren.data.items];

  const found = allCollections.find(c => c.title.toLowerCase() === name.toLowerCase());
  return found ? found._id : null;
}

program
  .name('raindrop-cli')
  .description('CLI for Raindrop.io integration')
  .version('1.0.0');

// 1. Search Bookmarks
program
  .command('search <query>')
  .description('Search bookmarks')
  .option('-c, --collection <collection>', 'Collection name or ID', '0')
  .action(async (query, options) => {
    try {
      const collectionId = await getCollectionIdByName(options.collection);
      if (collectionId === null) {
        console.error(`Collection "${options.collection}" not found.`);
        return;
      }

      const res = await client.get(`/raindrops/${collectionId}`, {
        params: { search: query },
      });

      if (res.data.items.length === 0) {
        console.log('No bookmarks found.');
        return;
      }

      res.data.items.forEach(item => {
        console.log(`[${item._id}] ${item.title}`);
        console.log(`   URL: ${item.link}`);
        console.log(`   Tags: ${item.tags.join(', ') || 'none'}`);
        console.log('---');
      });
    } catch (error) {
      console.error('Error searching:', error.response?.data || error.message);
    }
  });

// 2. Collections
const collections = program.command('collections').description('Manage collections');

collections
  .command('list')
  .description('List all collections')
  .action(async () => {
    try {
      const res = await client.get('/collections');
      const resChildren = await client.get('/collections/childrens');
      const all = [...res.data.items, ...resChildren.data.items];
      
      all.forEach(c => {
        console.log(`${c._id}: ${c.title} (${c.count} items)`);
      });
    } catch (error) {
      console.error('Error listing collections:', error.response?.data || error.message);
    }
  });

collections
  .command('create <name>')
  .description('Create a new collection')
  .action(async (name) => {
    try {
      const res = await client.post('/collection', { title: name });
      console.log(`Collection created: ${res.data.item.title} (ID: ${res.data.item._id})`);
    } catch (error) {
      console.error('Error creating collection:', error.response?.data || error.message);
    }
  });

// 3. Tags
program
  .command('tags')
  .description('List all tags')
  .action(async () => {
    try {
      const res = await client.get('/tags');
      res.data.items.forEach(t => {
        console.log(`${t._id} (count: ${t.count})`);
      });
    } catch (error) {
      console.error('Error listing tags:', error.response?.data || error.message);
    }
  });

// 4. Create Bookmark
program
  .command('add <url>')
  .description('Add a new bookmark')
  .option('-t, --title <title>', 'Bookmark title')
  .option('-c, --collection <collection>', 'Collection name or ID', 'Unsorted')
  .option('-g, --tags <tags>', 'Comma separated tags')
  .action(async (url, options) => {
    try {
      let collectionId = await getCollectionIdByName(options.collection);
      
      // If collection name provided but not found, default to Unsorted (-1)
      if (collectionId === null) {
          console.warn(`Collection "${options.collection}" not found. Using "Unsorted".`);
          collectionId = -1;
      }

      const tags = options.tags ? options.tags.split(',').map(s => s.trim()) : [];

      const res = await client.post('/raindrop', {
        link: url,
        title: options.title,
        collectionId: collectionId,
        tags: tags,
      });

      console.log(`Bookmark added: ${res.data.item.title} (ID: ${res.data.item._id})`);
    } catch (error) {
      console.error('Error adding bookmark:', error.response?.data || error.message);
    }
  });

// 5. Delete Bookmark
program
  .command('rm <id>')
  .description('Delete a bookmark')
  .action(async (id) => {
    try {
      await client.delete(`/raindrop/${id}`);
      console.log(`Bookmark ${id} deleted.`);
    } catch (error) {
      console.error('Error deleting:', error.response?.data || error.message);
    }
  });

program.parse(process.argv);
