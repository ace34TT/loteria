import * as admin from "firebase-admin";
import path from "path";
const tempDirectory = path.resolve(__dirname, "../images/");
import fs from "fs";
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "file-server-f5b74",
    clientEmail:
      "firebase-adminsdk-c9in6@file-server-f5b74.iam.gserviceaccount.com",
    privateKey:
      "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDaVZm33j2mF38i\nrZpQLUzi3HKb3rpBfwVqw7uiKF2z0ruFsP18O1LAVY8cITDQIv/WMC1BXhWyjlIt\nw3lvfOb7i1aR6xJBWl7x6MQHIgt3k2j5OOBECo9zf8GgK/1s0kAYzNwGJoFyGZcg\napYzVOsNM+inDeL7JVSUAcCVPVjpauop71kOtvMF2ESR0TuJzl1+7jT2dwpydV2a\n1m/5gNXwkGP5r7t9AbydNC5kgPAHtJJ2WoZ5VpcogsEn2nl30dM7Y6ZSDn0iYTPT\nu9sKjrcVdhwHBPXRhddI58eGBw895tydji9fyZv2g+tTyr8yhOKW6b3iTOyN23ii\ndsItZit5AgMBAAECggEANFqgYKGvALvTpZohTaZ/MEsSRGQVH4143BARVyH8zhjz\nFGzLa9XB0xLxHRqsXMx3soGc6HbKFyXfeM/Nt7konhrcaGMI3pjv+WwKTXeRblvv\nqQtFY6twmI6C/Ihv3X9RFWFSRTtIgPa38XL9j1OGhYTz/dLrobNi45bD+kVao6Wo\nyxgHvhnMB9oYqQ/0Y+Xgi8m+1fXyPskRKkqtIPtZ9F/mUhVohcRlAhErIlti80PD\nrisUMqV2OxX7I5QRxJId7i71u65owvbeWEX5C6DRZ1MZq3d3QfE9/sgO21nd2Zxe\nQP3xC+9+x/k8PXYD75kd+L23mAHG4hfW5Tu8hQXDXQKBgQD+2/PNzwx+LFsQ53rM\nhowRl7aMsX6hvcdi/f4E18FfDbykaMWSC7ruQ6GDegOO0FCqV3M1dEn3lCsOa+od\nlFkaKjGSyET4mTDfjdCFh46PSFqlqhJebEPjslcmn/KMo+N57h6hqWp5vbqAQps+\nThtghMJLDuC+VrGdJRzRNxJn3wKBgQDbT8suXCozqXrZAgzX9NZ7HhggK3rTIkIr\n4nSzEyTjVYt9dfmk2pwz6V0FVYpPI9SWMtSTqtLYGPDret9hAnDpaVfvn88lm2QT\n+ThQ8NCanKsb8YMCGxSRcIKf9qsDAl1PNnILmtUYbH3UD+1Ti/SmQPHMr9roFqL1\nbCN8vFy3pwKBgQC80eMY6TydQmmZ5ZZib5DY++kg5eQnGv7dRcbseZlnvjq0KHew\nU4aEPpEsYrq+FXKeMbpGsUiX6CvaPHOwxJcbPoWJ9Vy8PmsqRdxnAd7KI1YdhRqk\n4FuQGDJfiINgVZAUZypEpcsgNUQ3AKIaEC5SXSnCCFzUSFDBV5y5GK9HSwKBgDjd\ncsB9k0+79SeJmYzxZh+cSQMmYv2V13SLjljUcO8lQjrwuR9es7veGYmFiYxFrRyY\n53e2hl8T8HwOaxc7S82py+xNEqgcp5FqQIj0OBKu5ssjDyYfoXCorKYPjn4EQe+F\nHYMWzYQ8tU+kJZRRKMlm84twWaFuJSjftj/kk2HnAoGBAJ7gW3zSSr0RvdOespel\n/qwCQJ5+bourJvLi/kjgzMafMfWaG4ElZ1n5isN17W7fRy4mjmmSFhQSVQ9gZ/n1\nlTgJvNYVb0jQ8y3tP4mQKrL1a4HWohpaxfNr80NT9YD7ov302eCEk4khNWrL1WzP\n60dVGwwNdQhfO+pxdaHc+EHW\n-----END PRIVATE KEY-----\n",
  }),
  storageBucket: "gs://file-server-f5b74.appspot.com",
});
export const uploadFileToFirebase = async (filename: string) => {
  const bucket = admin.storage().bucket();
  await bucket.upload(path.resolve(tempDirectory + "/" + filename), {
    destination: "images/" + filename,
  });
  const fileRef = bucket.file("images/" + filename);
  await fileRef.makePublic();
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;
  return publicUrl;
};
