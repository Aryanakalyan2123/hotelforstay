const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve your HTML, CSS, JS, images from public folder
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "intro.html"));
});


// ===============================
// GMAIL SETUP
// ===============================

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// Check Gmail connection
transporter.verify((error, success) => {

    if (error) {

        console.log("❌ Gmail connection failed");
        console.log(error.message);

    } else {

        console.log("✅ Gmail is connected successfully");

    }

});


// ===============================
// HOME PAGE
// ===============================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "intro.html")
    );


});


// ===============================
// BOOKING / ORDER
// ===============================

app.post("/send-order", async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            room,
            checkIn,
            checkOut,
            guests,
            food,
            message
        } = req.body;


        // ===============================
        // EMAIL TO HOTEL
        // ===============================

        const hotelEmail = {

            from: process.env.EMAIL_USER,

            to: process.env.RECEIVER_EMAIL,

            subject: `New Hotel Booking - ${name}`,

            html: `

                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 650px;
                    margin: auto;
                    padding: 30px;
                    border: 1px solid #ddd;
                    border-radius: 12px;
                ">

                    <h1 style="text-align:center;">
                        🏨 New Hotel Booking
                    </h1>

                    <hr>

                    <h2>Guest Details</h2>

                    <p>
                        <strong>Name:</strong>
                        ${name || "Not provided"}
                    </p>

                    <p>
                        <strong>Email:</strong>
                        ${email || "Not provided"}
                    </p>

                    <p>
                        <strong>Phone:</strong>
                        ${phone || "Not provided"}
                    </p>


                    <h2>Room Details</h2>

                    <p>
                        <strong>Room:</strong>
                        ${room || "Not provided"}
                    </p>

                    <p>
                        <strong>Check-in:</strong>
                        ${checkIn || "Not provided"}
                    </p>

                    <p>
                        <strong>Check-out:</strong>
                        ${checkOut || "Not provided"}
                    </p>

                    <p>
                        <strong>Guests:</strong>
                        ${guests || "Not provided"}
                    </p>


                    <h2>Food Order</h2>

                    <p>
                        ${food || "No food ordered"}
                    </p>


                    <h2>Additional Message</h2>

                    <p>
                        ${message || "No additional message"}
                    </p>

                    <hr>

                    <p style="color:#777;">
                        This booking was submitted from the
                        Serenity Hotel website.
                    </p>

                </div>

            `
        };


        // Send email to hotel
        await transporter.sendMail(hotelEmail);


        // ===============================
        // CONFIRMATION EMAIL TO CUSTOMER
        // ===============================

        if (email) {

            const customerEmail = {

                from: process.env.EMAIL_USER,

                to: email,

                subject: "Booking Request Received - Serenity Hotel",

                html: `

                    <div style="
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: auto;
                        padding: 30px;
                    ">

                        <h1>
                            Thank You, ${name || "Guest"}!
                        </h1>

                        <p>
                            We have successfully received
                            your booking request.
                        </p>

                        <p>
                            Our hotel team will contact you
                            shortly to confirm your reservation.
                        </p>

                        <hr>

                        <h3>Booking Details</h3>

                        <p>
                            <strong>Room:</strong>
                            ${room || "Not provided"}
                        </p>

                        <p>
                            <strong>Check-in:</strong>
                            ${checkIn || "Not provided"}
                        </p>

                        <p>
                            <strong>Check-out:</strong>
                            ${checkOut || "Not provided"}
                        </p>

                        <p>
                            <strong>Guests:</strong>
                            ${guests || "Not provided"}
                        </p>

                        <hr>

                        <p>
                            Regards,<br>
                            <strong>Serenity Hotel</strong>
                        </p>

                    </div>

                `
            };


            await transporter.sendMail(customerEmail);

        }


        // ===============================
        // SUCCESS RESPONSE
        // ===============================

        res.status(200).json({

            success: true,

            message:
                "Booking submitted successfully!"

        });


    } catch (error) {

        console.error("❌ Email Error:");
        console.error(error);


        res.status(500).json({

            success: false,

            message:
                "Unable to send booking."

        });

    }

});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log("");
    console.log("================================");
    console.log("🏨 SERENITY HOTEL SERVER");
    console.log("================================");
    console.log(`Server running on port ${PORT}`);
    console.log(`Open: http://localhost:${PORT}`);
    console.log("================================");
    console.log("");

});
