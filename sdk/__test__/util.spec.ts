import axios from 'axios'
import { fetchJwt } from '../utils';

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
const testJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

describe("fetchJWT", () => {

    it("should return valid jwt", async () => {
        mockedAxios.post.mockResolvedValueOnce({data: testJWT})
        const jwt = await fetchJwt({})
        expect(jwt).toEqual(testJWT)
    })

    it("should return a mock jwt when called in local mode", async () => {
        mockedAxios.post.mockImplementationOnce(() => {
            throw new Error('ENOTFOUND forta-jwt-provider')
        })

        jest.spyOn(console, "warn").mockImplementation(() => {});

        const jwt = await fetchJwt({})
        expect(jwt).toBeDefined()
    })

    it("should throw an error for failing to fetch jwt", async () => {
        mockedAxios.post.mockImplementationOnce(() => {
            throw new Error('something went wrong')
        })
        expect(await fetchJwt({})).toThrow('something went wrong')
    })
})