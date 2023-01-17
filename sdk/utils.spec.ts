import { provideFetchJwt } from "./utils"

describe("JWT util methods", () => {
    const testJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

    describe("fetchJWT", () => {
        const mockAxios = {
            post: jest.fn()
        } as any

        const resetMocks = () => {
            mockAxios.post.mockReset()
        }

        const mockAnalyzerJWTResponse = {
            data: {
                token: testJWT
            }
        }

        beforeEach(() => resetMocks())

        it("should return a JWT as a string", async () => {
            mockAxios.post.mockReturnValueOnce(mockAnalyzerJWTResponse)

            const token = await provideFetchJwt({}, undefined, mockAxios);
            expect(token).toEqual(testJWT)
        })
    })
})