const entryForm = document.getElementById('entryForm');
const entryInput = document.getElementById('fake-textarea');
const entriesList = document.getElementById('entriesList');
const darkModeToggle = document.getElementById('darkModeToggle');
const snapshotModal = document.getElementById('snapshotModal');
const snapshotCanvas = document.getElementById('snapshotCanvas');
const downloadSnapshotBtn = document.getElementById('downloadSnapshot');
const copySnapshotBtn = document.getElementById('copySnapshot');
const closeModalBtn = document.getElementById('closeModal');

let entries = JSON.parse(localStorage.getItem('entries')) || [];

function saveEntries() {
    localStorage.setItem('entries', JSON.stringify(entries));
}

function addEntry(content) {
    const newEntry = {
        id: Date.now(),
        content: content,
        date: new Date().toLocaleDateString()
    };
    entries.unshift(newEntry);
    saveEntries();
    renderEntries();
}

function deleteEntry(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You won’t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel',
    }).then((result) => {
        if (result.isConfirmed) {
            entries = entries.filter(entry => entry.id !== id);
            saveEntries();
            renderEntries();

            Swal.fire(
                'Deleted!',
                'Your entry has been deleted.',
                'success'
            );
        }
    });
}

function renderEntries() {
    entriesList.innerHTML = '';
    let currentDate = '';

    entries.forEach(entry => {
        if (entry.date !== currentDate) {
            currentDate = entry.date;
            const dateHeader = document.createElement('li');
            dateHeader.className = 'date-header';
            dateHeader.textContent = currentDate;
            entriesList.appendChild(dateHeader);
        }

        const li = document.createElement('li');
        li.className = 'entry';
        li.innerHTML = `
            <div class="entry-content">${entry.content}</div>
            <div class="entry-actions">
                <span class="snapshot-btn" data-id="${entry.id}" title="Create Snapshot">📷</span>
                <span class="delete-btn" data-id="${entry.id}" title="Delete Entry">🗑️</span>
            </div>
        `;
        entriesList.appendChild(li);
    });
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
}

function createSnapshot(entry) {
    const canvas = snapshotCanvas;
    const ctx = canvas.getContext('2d');
    const width = 500;
    const height = 300;
    canvas.width = width;
    canvas.height = height;

    // Create a white gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); // Top is white
    gradient.addColorStop(1, 'rgba(230, 230, 230, 1)'); // Bottom is light gray
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw colorful blobs
    const blobCount = 10; // Number of blobs
    for (let i = 0; i < blobCount; i++) {
        const x = Math.random() * width; // Random x position
        const y = Math.random() * height; // Random y position
        const radius = Math.random() * 40 + 20; // Random radius between 20 and 60

        // Random color for each blob
        const color = `hsl(${Math.random() * 360}, 100%, 50%)`; // HSL color for vibrant colors

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2); // Draw a circle
        ctx.fillStyle = color; // Set the fill color to the random color
        ctx.fill(); // Fill the circle
        ctx.closePath();
    }

    // Create a blurry effect by drawing a rectangle with a blur effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // Semi-transparent white
    ctx.fillRect(0, 0, width, height); // Draw a semi-transparent overlay

    // Set initial font size for text
    let fontSize = 20; // Start with a larger font size
    ctx.fillStyle = '#000000'; // Black color for text
    ctx.font = `${fontSize}px Arial`;
    ctx.fillText(entry.date, 30, 50);

    ctx.fillStyle = '#ff0000'; // Set color for main content text
    const words = entry.content.split(' ');
    let line = '';
    let y = 80;
    const lineHeight = 30; // Fixed line height
    const maxHeight = height - 100; // Maximum height for text area
    let lineCount = 0;

    // Measure text to see how many lines we need
    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > width - 60 && i > 0) {
            lineCount++;
            line = words[i] + ' ';
        } else {
            line = testLine;
        }
    }

    // Calculate total height based on line count
    let totalHeight = lineCount * lineHeight + lineHeight; // + lineHeight for the last line

    // Adjust font size if total height exceeds maxHeight
    while (totalHeight > maxHeight && fontSize > 10) { // Prevent font size going below 10
        fontSize -= 2; // Decrease font size
        ctx.font = `${fontSize}px Arial`; // Update font in context
        totalHeight = lineCount * lineHeight + lineHeight; // Recalculate total height
    }

    // Reset y position for drawing text
    y = 80;
    line = '';

    // Draw text
    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > width - 60 && i > 0) {
            ctx.fillText(line, 30, y);
            line = words[i] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }

        // Check if y exceeds canvas height
        if (y > height - 60) {
            break; // Stop rendering if the text exceeds the canvas height
        }
    }
    ctx.fillText(line, 30, y);

    // Add website name with glow effect
    ctx.fillStyle = '#000000'; // Black color for text
    ctx.font = '16px Arial';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.fillText('Made with Zen Note', width - 180, height - 20);
    ctx.shadowBlur = 0;

    snapshotModal.style.display = 'block';
}


document.addEventListener("DOMContentLoaded", function() {
    const fakeTextarea = document.getElementById("fake-textarea");
    const hiddenTextArea = document.getElementById("hiddenTextArea");
    const errorMessage = document.getElementById("error-message");
    const entryForm = document.getElementById("entryForm");

    // Function to toggle placeholder appearance
    function togglePlaceholder() {
        if (fakeTextarea.textContent.trim() === "") {
            fakeTextarea.classList.add("empty");
        } else {
            fakeTextarea.classList.remove("empty");
        }
    }

    // Validate the form on submission
    entryForm.addEventListener("submit", function(event) {
        const textContent = fakeTextarea.textContent.trim();
        
        if (textContent === "") {
            errorMessage.style.display = "block"; // Show error message
            fakeTextarea.classList.add("error");
            event.preventDefault(); // Prevent form submission
        } else {
            errorMessage.style.display = "none"; // Hide error message
            fakeTextarea.classList.remove("error");
            hiddenTextArea.value = textContent; // Set the hidden input value to send with form
            fakeTextarea.innerText = "";
            setTimeout(() => {
                fakeTextarea.focus(); // Focus on the fake textarea after submission
            }, 50);
        }
    });

    // Initialize placeholder on load
    togglePlaceholder();

    // Add event listeners
    fakeTextarea.addEventListener("input", togglePlaceholder);
    fakeTextarea.addEventListener("focus", togglePlaceholder);
    fakeTextarea.addEventListener("blur", togglePlaceholder);
});



entryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const content = entryInput.innerText.trim();
    console.log(content);
    if (content) {
        addEntry(content);
        entryInput.value = '';
    }
});

entriesList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const id = parseInt(e.target.getAttribute('data-id'));
        deleteEntry(id);
    } else if (e.target.classList.contains('snapshot-btn')) {
        const id = parseInt(e.target.getAttribute('data-id'));
        const entry = entries.find(entry => entry.id === id);
        createSnapshot(entry);
    }
});

darkModeToggle.addEventListener('click', toggleDarkMode);

downloadSnapshotBtn.addEventListener('click', () => {
    const dataUrl = snapshotCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'daily-learning-snapshot.png';
    link.click();
});

copySnapshotBtn.addEventListener('click', () => {
    snapshotCanvas.toBlob(blob => {
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]).then(() => {
            Swal.fire({
                title: 'Snapshot Copied!',
                text: 'Your snapshot has been successfully copied to the clipboard.',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        }).catch(()=>{
            Swal.fire({
                title: 'Oops!',
                text: 'Something went wrong. Couldn’t copy the snapshot to the clipboard.',
                icon: 'error',
                confirmButtonText: 'Try Again'
            });
        })
    });
});

closeModalBtn.addEventListener('click', () => {
    snapshotModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === snapshotModal) {
        snapshotModal.style.display = 'none';
    }
});

// Initialize dark mode based on user preference
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    toggleDarkMode();
}

renderEntries();