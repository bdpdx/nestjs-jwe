import { FirestoreDataConverter } from 'firebase-admin/firestore';
import { User } from 'src/users/user.interface';

export const firebaseUserConverter: FirestoreDataConverter<User> = {
    fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): User {
        const data = snapshot.data();

        return {
            createdAt: data.createdAt,
            email: data.email,
            id: data.id,
            isDisabled: data.isDisabled,
            isEmailVerified: data.isEmailVerified,
            role: data.role,
        };
    },

    toFirestore(user: User): FirebaseFirestore.DocumentData {
        return { ...user };
    },
};
