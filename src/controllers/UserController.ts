import { AppError } from './../errors/AppError';
import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { UsersRepository } from "../repositories/UsersRepository";
import * as yup from "yup";

class UserController {
    async create(request: Request, response: Response) {
        const { name, email } = request.body;

        const schema = yup.object().shape({
            name: yup.string().required("Nome obrigatório"),
            email: yup.string().email("Não é um e-mail válido").required("E-mail incorreto")
        });

        //if (!(await schema.isValid(request.body))) {
        //    return response.status(400).json({
        //        error: "Validation failed!"
        //    });
        //}

        try {
            await schema.validate(request.body, { abortEarly: false });
        }
        catch (err) {
            throw new AppError(err);
        }

        const usersRepository = getCustomRepository(UsersRepository);

        // SELECT * FROM USERS WHERE EMAIL = "EMAIL"
        const userAlreadyExists = await usersRepository.findOne({
            email
        });

        if (userAlreadyExists) {
            throw new AppError("User already exists!");
        }

        const user = usersRepository.create({
            name, email
        });

        await usersRepository.save(user);

        return response.status(201).json(user);
    }
}

export { UserController };
