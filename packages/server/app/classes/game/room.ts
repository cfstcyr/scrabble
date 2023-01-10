import { v4 as uuidv4 } from 'uuid';

export default class Room {
    private id: string;

    constructor() {
        this.id = uuidv4();
    }

    getId(): string {
        return this.id;
    }
}
