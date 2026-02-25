import request from "supertest";
import app from "../src/app.js";


//integration tests
describe('Auth Routes', () => {
    
    it('should signup a new user', async () => {
        const res = await request(app)
            .post('/signup')
            .send({
                name: "Test User",
                email: "test@mail.com",
                password: "password123"
            })

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
    })

    it('should login an existing user', async () => {
        const res = await request(app)
        .post('/login')
        .send({
            email: "test@mail.com",
            password: "password123"
        })

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    })
    
    it('basic test works',() => {
        expect(1+1).toBe(2)
    })
})