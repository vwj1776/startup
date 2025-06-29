const fs = require('fs');
const pdf = require('pdf-parse');
const { connectToDatabase, getCollections } = require('./db');

async function main() {
    const db = await connectToDatabase();
    const { ChatChunk } = await getCollections();

    // Load your DAFI 36-2903 PDF
    const pdfBuffer = fs.readFileSync('./dafi36-2903.pdf');
    const data = await pdf(pdfBuffer);

    const fullText = data.text;
    console.log('✅ PDF Loaded, starting to chunk...');

    // Chunking: split into 1000 character chunks
    const chunks = [];
    const chunkSize = 1000;
    for (let i = 0; i < fullText.length; i += chunkSize) {
        const chunk = fullText.substring(i, i + chunkSize);
        chunks.push(chunk);
    }

    console.log(`✅ Created ${chunks.length} chunks, now inserting into MongoDB...`);

    // Insert each chunk into MongoDB without embeddings
    for (const chunk of chunks) {
        await ChatChunk.insertOne({
            page_title: "DAFI 36-2903",
            content: chunk,
            createdAt: new Date()
        });
    }

    console.log('✅ All chunks inserted into MongoDB (no embeddings)');
}

main().catch((err) => {
    console.error('❌ Ingest Error:', err);
});
