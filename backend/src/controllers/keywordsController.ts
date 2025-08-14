import { Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabaseClient'; // Use user-context client
import { ApiError } from '../utils/ApiError';

// GET all keyword lists for the user
export const getKeywordLists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        const { data, error } = await supabase
            .from('keyword_lists')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw new ApiError(500, error.message);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// POST a new keyword list
export const createKeywordList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        const { list_name, keywords } = req.body;

        if (!list_name || !keywords || !Array.isArray(keywords) || keywords.length === 0) {
            throw new ApiError(400, 'list_name and a non-empty array of keywords are required.');
        }

        const { data, error } = await supabase
            .from('keyword_lists')
            .insert({
                user_id: user.id,
                list_name,
                keywords,
            })
            .select()
            .single();

        if (error) throw new ApiError(500, error.message);
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
};

// PUT (update) a keyword list
export const updateKeywordList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        const { id } = req.params;
        const { list_name, keywords, is_default } = req.body;

        const { data, error } = await supabase
            .from('keyword_lists')
            .update({ list_name, keywords, is_default })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw new ApiError(500, error.message);
        if (!data) throw new ApiError(404, 'Keyword list not found.');
        
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// DELETE a keyword list
export const deleteKeywordList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        const { id } = req.params;

        const { error } = await supabase
            .from('keyword_lists')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);
            
        if (error) throw new ApiError(500, error.message);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};