interface ResponseI <T> {
    status: number;
    data: T;
    contentType?: string;
}

export default ResponseI;
