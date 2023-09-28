import * as admin from "firebase-admin";
import path from "path";
const tempDirectory = path.resolve(__dirname, "../tmp/");
import fs from "fs";
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "file-server-f5b74",
    clientEmail:
      "firebase-adminsdk-c9in6@file-server-f5b74.iam.gserviceaccount.com",
    privateKey:
      "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC/8bsk7+AP0qFn\nqdhTlNAmLGiEIxCalKNO4rARF+E1CNJHr1DRPNaxFgnILBtgORku7BPQm/FlESRD\nVe01w6XTzX831iX8sT89Cz/UNY+bbAOYDsq1wEMiD/G+2slktjhwP3V36c0jtwYy\nSalXolvjNzulENfpMR8oFImfPzi+wksBxlJRbQPiN0HQttI/tiWxLqgikMoCVtYQ\ntPjGC0ecju05MELm2Fw2P+9XJNE2sOhoc1qj2paomkrg46JLoVIxfNikpAFSxi1p\nb+Y3zoybfdKULpOlqioUeAJnKk3S/U+n+8XzuqBsIXYV2Ro1FmypTJ19fmydkW1t\nV4h1kEDnAgMBAAECggEAGaeeG1xCZusArsHZS6aWwZtq5spnBDo8r6UF4mr+K1//\n9xvcIfNPQMEQ0qPujshi8M4WAept89O8NJHOEEMTrYEIcXaagjFQogCYae00whHI\nUzEa7/sAHhPifF9yzpa6aWpZ8Yqa5Byo49zLmQ522KI/wxrCuQTbRLimAlZpZ7mG\nD5TKe7PtW+Wt0lHuxRT3SjvXo32t3U3vvJuJo2INQMBTOOm1HpHYIGZKVjbP0AVc\n6qoD2VxnyL7gOiyz4eGanXtNCv4KenykIlqXtt9InsfXT08Jj72E9V2awKcBuX9X\nN7bFxaBXv8lqxvbNHoWaM7G1pdEHo56H1IDoR14tIQKBgQDmJu+JcUeulF5kJ/Kd\nfLrjCCQRV1M3G3RxLLJL903CmCEYaVP3O3bmrsBmdrOW0g4DH+TBlnp3lEFPHSmw\nOYdEjxZ8OrnKIuM4RT96V0wYFQ+6CeRwnKRZ1mD4XsCwCJSzaNbUQ7vNpT9Bdw5P\nLnCSfaNxJWfT/EeJHm0X0O0thwKBgQDVgEnUIKYgt9T8slhNoc3CmnQ6X5gTFcSK\nBTAZR68jAEMawYrI82DppjsrZixmxtuYQlHDyI6KrtuQOmmtI98IW0+9Y8KwZg1n\nabH2BsuBGtK+244prQiKS3zuHXY+ztWZqJrAjEOUa7IKSm5DUqvZ/I1TdifxWqGZ\nSR9JMgQpoQKBgQDCK5ktsLeULzKPdzB187RMNCMRykW3mV8c2GO4OXWONgC98qbX\nT4DZ0BccmwqatK8DrdW2CXlbB2YuE+GG/pIDomCLAJScV+CxKaMLWTkmnCY/g3cK\nFu2FqZr4ECCqoyKpVkrgnCCGt+JtHb+hyAFLZdoNbExziUTlBxls3WQsYwKBgBO5\nuZh+t7qYIXaDZ8Msat1K9egawusofLMfzZTYWacLNCf5r7/nNJIByL+2ve10+/7y\nSamkEv9fLmwB6ZeUk9uqzBA8clVn6F8glc+cSxsPhl8Z2+Wf1gUo+k7pq+4boAKF\nYF7f1rKUzKtEuzE/Jx+JxOjsJr6W2A1Ygyp5E4dhAoGAL8n9EieUKxq+Twr9IHaM\nhEUuk/pwR19Io/MyQXxB+pQMV8+daKWaGHHbBfgPfy4XRp/9cn0aH1/US+43Lsiu\nhuo2ghT38aDy90hK0L8U2j7hdnr4bKpH/7HWwkkUEHG2AjC22iuRYsAbXGghMR32\neXF2vrv+azfqBWT/FR9g9/g=\n-----END PRIVATE KEY-----\n",
  }),
  storageBucket: "gs://file-server-f5b74.appspot.com",
});
export const uploadFileToFirebase = async (filename: string) => {
  const bucket = admin.storage().bucket();
  await bucket.upload(path.resolve(tempDirectory + "/" + filename), {
    destination: "loteria/" + filename,
  });
  const fileRef = bucket.file("loteria/" + filename);
  await fileRef.makePublic();
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;
  return publicUrl;
};
export const deleteFile = async (filename: string) => {
  try {
    const bucket = admin.storage().bucket();
    const file = bucket.file("loteria/" + filename);
    await file.delete();
  } catch (error: any) {
    console.log(error.message);
    throw new Error(error.message);
  }
};
