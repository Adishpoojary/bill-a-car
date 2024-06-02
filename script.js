let startTime;
let parkedNumberPlate;

function parkCar() {
    const numberPlateFile = document.getElementById('numberPlateFile').files[0];
    if (!numberPlateFile) {
        alert('Please upload a file with the number plate.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        if (numberPlateFile.type === 'text/plain') {
            parkedNumberPlate = e.target.result.trim();
            processParking();
        } else {
            Tesseract.recognize(e.target.result, 'eng', {
                logger: m => console.log(m)
            }).then(({ data: { text } }) => {
                parkedNumberPlate = text.trim();
                processParking();
            }).catch(err => {
                console.error("Error with OCR: " + err);
                alert('Error reading number plate from image.');
            });
        }
    };
    if (numberPlateFile.type === 'text/plain') {
        reader.readAsText(numberPlateFile);
    } else {
        reader.readAsDataURL(numberPlateFile);
    }
}

function processParking() {
    startTime = new Date().getTime();
    document.getElementById('message').innerHTML = `Car with number plate ${parkedNumberPlate} parked.`;
    document.getElementById('parkSection').style.display = 'none';
    document.getElementById('leaveSection').style.display = 'block';

    setTimeout(() => {
        document.getElementById('message').innerHTML += '<br>1 minute has passed. You can now leave and calculate the bill.';
    }, 60000);  // 60000 milliseconds = 1 minute
}

function leaveCar() {
    const leaveNumberPlateFile = document.getElementById('leaveNumberPlateFile').files[0];
    if (!leaveNumberPlateFile) {
        alert('Please upload a file with the number plate.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        if (leaveNumberPlateFile.type === 'text/plain') {
            const leaveNumberPlate = e.target.result.trim();
            processLeaving(leaveNumberPlate);
        } else {
            Tesseract.recognize(e.target.result, 'eng', {
                logger: m => console.log(m)
            }).then(({ data: { text } }) => {
                const leaveNumberPlate = text.trim();
                processLeaving(leaveNumberPlate);
            }).catch(err => {
                console.error("Error with OCR: " + err);
                alert('Error reading number plate from image.');
            });
        }
    };
    if (leaveNumberPlateFile.type === 'text/plain') {
        reader.readAsText(leaveNumberPlateFile);
    } else {
        reader.readAsDataURL(leaveNumberPlateFile);
    }
}

function processLeaving(leaveNumberPlate) {
    if (leaveNumberPlate !== parkedNumberPlate) {
        alert('Number plate does not match the parked car.');
        return;
    }

    const endTime = new Date().getTime();
    const duration = (endTime - startTime) / 1000;  // duration in seconds
    const minutesParked = Math.ceil(duration / 60);
    const ratePerMinute = 5;  // Example rate per minute
    const billAmount = minutesParked * ratePerMinute;

    const billDetails = `
        Number Plate: ${parkedNumberPlate}<br>
        Time Parked: ${minutesParked} minute(s)<br>
        Rate per Minute: ₹${ratePerMinute.toFixed(2)}<br>
        Total Amount: ₹${billAmount.toFixed(2)}
    `;
    document.getElementById('billDetails').innerHTML = billDetails;
    document.getElementById('bill').style.display = 'block';
    document.getElementById('leaveSection').style.display = 'none';

    startQrScanner();
}
function startQrScanner() {
    const html5QrCode = new Html5Qrcode("qr-reader");
    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        document.getElementById('qr-reader-results').innerHTML = `
            <strong>Payment Successful!</strong><br>
            Decoded Text: ${decodedText}
        `;
        html5QrCode.stop().then(ignore => {
            // QR Code scanning stopped.
        }).catch(err => {
            console.error("Failed to stop QR code scanner.");
        });
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback)
        .catch(err => {
            console.error("Unable to start QR code scanner.", err);
        });
}
