interface User {
  id: number;
  displayName: string;
  email: string;
}

export function getUser(request: Request) {
  console.log(request);
  return new Promise<User>(resolve => {
    setTimeout(() => {
      resolve({
        id: 1,
        displayName: 'John Doe',
        email: 'abc@123.com'
      });
    }, 1000)
  })
}

export function updateUser(id: number, body: Omit<User, 'id'>) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        id,
        ...body
      });
    }, 1000)
  })
}