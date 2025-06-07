from flask import Flask, request
import smtplib
from email.message import EmailMessage

app = Flask(__name__)

@app.route('/contact', methods=['POST'])
def contact():
    name = request.form['name']
    email = request.form['email']
    message = request.form['message']

    msg = EmailMessage()
    msg['Subject'] = f"New message from {name}"
    msg['From'] = 'your@email.com'
    msg['To'] = 'your@email.com'
    msg.set_content(f"From: {name} <{email}>\n\n{message}")

    with smtplib.SMTP('smtp.yourprovider.com', 587) as server:
        server.starttls()
        server.login('your@email.com', 'yourpassword')
        server.send_message(msg)

    return 'Message sent!'

if __name__ == '__main__':
    app.run(debug=True)
