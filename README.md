# This Demo is is live on: admin-panel-iota-jet.vercel.app
# Backend is deployed on: Railway
# Frontend is deployed on: Vercel
# DB is live on aiven - mysql

### For local setup : 
### Rename .env.example to .env
#### Seperate Readme.Md is added for both fronted and backend please read for next steps.
### For the first admin creation through MySQL:
#### Use admin_panel 
#### INSERT INTO admins (username, password, role, createdAt, updatedAt)
#### VALUES (
####  'admin',
####  '$2b$10$rqBUyeCkwxFBVKDYGfTTKOWwUSu1rxm1dAlQHjy/vzFf7rQQChsyW', 
#### 'admin',
#### NOW(),
#### NOW()
####  );

#### Decrypted Value = admin123
