import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
    getAuth = () => admin.auth();
    getFirestore = () => admin.firestore();

    onModuleInit() {
        const filePath = path.resolve(__dirname, '../../.ignored/firebase-service-account.json');
        const serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }
}
