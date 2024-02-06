const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());

// Function to list files and directories
async function listFilesAndDirectories(directoryPath) {
    try {
        const filesAndDirs = await fs.readdir(directoryPath);
        return filesAndDirs;
    } catch (error) {
        throw new Error(`Error listing files and directories: ${error}`);
    }
}

// Function to create directory
async function createDirectory(directoryPath) {
    try {
        await fs.mkdir(directoryPath);
    } catch (error) {
        throw new Error(`Error creating directory: ${error}`);
    }
}

// Function to create file
async function createFile(filePath, data) {
    try {
        await fs.writeFile(filePath, data);
    } catch (error) {
        throw new Error(`Error creating file: ${error}`);
    }
}

// Function to read file
async function readFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return data;
    } catch (error) {
        throw new Error(`Error reading file: ${error}`);
    }
}

// Function to update file
async function updateFile(filePath, data) {
    try {
        await fs.writeFile(filePath, data);
    } catch (error) {
        throw new Error(`Error updating file: ${error}`);
    }
}

// Function to delete file or directory
async function deleteFileOrDirectory(targetPath) {
    try {
        const stats = await fs.stat(targetPath);
        if (stats.isDirectory()) {
            await fs.rmdir(targetPath, { recursive: true });
        } else {
            await fs.unlink(targetPath);
        }
    } catch (error) {
        throw new Error(`Error deleting file or directory: ${error}`);
    }
}

// Function to search for files/directories
async function searchFilesAndDirectories(searchTerm, currentDirectory) {
    try {
        const searchResults = [];
        const filesAndDirs = await fs.readdir(currentDirectory);
        for (const fileOrDir of filesAndDirs) {
            const filePath = path.join(currentDirectory, fileOrDir);
            const stats = await fs.stat(filePath);
            if (stats.isDirectory()) {
                const nestedResults = await searchFilesAndDirectories(searchTerm, filePath);
                searchResults.push(...nestedResults);
            } else if (fileOrDir.includes(searchTerm)) {
                searchResults.push(filePath);
            }
        }
        return searchResults;
    } catch (error) {
        throw new Error(`Error searching files and directories: ${error}`);
    }
}

// Route to display files and directories
app.get('/list/:directory?', async (req, res) => {
    try {
        const directory = req.params.directory || '.';
        const directoryPath = path.resolve(directory);
        console.log(directoryPath);
        const filesAndDirs = await listFilesAndDirectories(directoryPath);
        res.json(filesAndDirs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to create directory
app.get('/create-dir/:directory', async (req, res) => {
    try {
        const directory = req.params.directory;
        const currentPath = process.cwd(); // Get current working directory
        const directoryPath = path.join(currentPath, directory); // Combine with the provided directory name
        await createDirectory(directoryPath);
        res.json({ message: `Directory '${directory}' created successfully` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to create file
app.get('/create-file/:fileName', async (req, res) => {
    try {
        const fileName = req.params.fileName;
        const filePath = path.resolve(fileName);
        const data = req.body.data || '';
        await createFile(filePath, data);
        res.json({ message: `File '${fileName}' created successfully` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to read file
app.get('/read-file/:fileName', async (req, res) => {
    try {
        const fileName = req.params.fileName;
        const filePath = path.resolve(fileName);
        const fileData = await readFile(filePath);
        res.json({ data: fileData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to update file
app.put('/update-file/:fileName', async (req, res) => {
    try {
        const fileName = req.params.fileName;
        const filePath = path.resolve(fileName);
        const data = req.body.data || '';
        await updateFile(filePath, data);
        res.json({ message: `File '${fileName}' updated successfully` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to delete file or directory
app.get('/delete/:target', async (req, res) => {
    try {
        const target = req.params.target;
        const targetPath = path.resolve(target);
        await deleteFileOrDirectory(targetPath);
        res.json({ message: `File or directory '${target}' deleted successfully` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to search files and directories
app.get('/search/:searchTerm', async (req, res) => {
    try {
        const searchTerm = req.params.searchTerm;
        const searchResults = await searchFilesAndDirectories(searchTerm, '.');
        res.json(searchResults);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
