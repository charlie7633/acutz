import { Client, Account, Databases, Storage } from 'react-native-appwrite';

export const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('699b4bcc001dba9897a1');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const appwriteConfig = {
    databaseId: '69d8e2130010bd3fbf52',
    photosBucketId: '699b5359003c85dc59ce',
    collectionId: 'stylists',
};
