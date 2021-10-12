const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const Document = require('./Document');
const config = require('./config/index');


const app = express();
const { PORT } = process.env;

if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) =>
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    );
}

const server = app.listen(PORT, (err) => {
    if (err) throw new Error(err);
    console.log(`Server is running on http://localhost:${PORT}`);
});

const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
  


try {
    mongoose.connect(config.databaseURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    console.log('Database Connected');
} catch (error) {
    console.log(`Error Starting MongoDB, ${error}`)
    throw error;
}


const defaultValue = '';

io.on('connection', socket => {
    console.log(`${socket.id} connected`);

    socket.on('get-document', async documentId => {
        const document = await findOrCreateDocument(documentId);
        socket.join(documentId)
        socket.emit('load-document', document.data);

        socket.on('send-change', delta => {
            socket.broadcast.to(documentId).emit('receive-changes', delta);
        })

        socket.on('save-document', async data => {
            await Document.findByIdAndUpdate(documentId, {data})
        })
    })
    
});
 
const findOrCreateDocument = async (id) => {
    if (id == null) return
    
    const document = await Document.findById(id)
    if (document) return document;
    return await Document.create({_id: id, data: defaultValue})
}