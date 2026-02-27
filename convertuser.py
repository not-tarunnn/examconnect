import json
import csv

# Load Firebase export JSON
with open('users.json', 'r') as f:
    data = json.load(f)

# Create CSV for Brevo
with open('brevo_contacts.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['email', 'first_name', 'last_name'])  # CSV headers

    for user in data['users']:
        email = user.get('email', '')
        name = user.get('displayName', '')
        if name:
            parts = name.split(' ', 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ''
        else:
            first_name = last_name = ''
        if email:  # Only write if email exists
            writer.writerow([email, first_name, last_name])