import { AnyAction as Action } from "redux";
import ArticleState from "../models/client/ArticleState";
import { GET_ARTICLE_SUCCESS, SAVE_ARTICLE_SUCCESS, GET_ARTICLE_BEGIN, SAVE_ARTICLE_BEGIN, SAVE_ARTICLE_FAILED, GET_ARTICLE_FAILED, RATE_ARTICLE_SUCCESS, GET_MORE_ARTICLE_SUCCESS, GET_MORE_ARTICLE_BEGIN, GET_MORE_ARTICLE_FAILED, SET_ARTICLE_CACHE, CLEAR_ARTICLE_CACHE } from "../actions/article";
import Article from "../models/Article";
import { UPDATE_PROFILE_SUCCESS } from "../actions/user";
import ArticleCache from "../models/client/ArticleCache";

const initialState: ArticleState = {
    loading: false,
    valid: false,
    data: [],
    loadingMore: false,
    hasMore: false,
    cache: {}
};

const article = (state: ArticleState = initialState, action: Action): ArticleState => {
    switch (action.type) {
        case GET_ARTICLE_BEGIN:
        case SAVE_ARTICLE_BEGIN:
            return {...state, loading: true};
        case GET_ARTICLE_SUCCESS:
            return {
                ...state,
                data: action.articles,
                valid: true,
                loading: false,
                hasMore: action.hasMore
            };
        case GET_MORE_ARTICLE_BEGIN:
            return {...state, loadingMore: true};
        case GET_MORE_ARTICLE_SUCCESS:
            return {
                ...state,
                data: [...state.data, ...action.articles],
                loadingMore: false,
                hasMore: action.hasMore
            };
        case SAVE_ARTICLE_SUCCESS:
        case UPDATE_PROFILE_SUCCESS:
            return {...state, valid: false, loading: false};
        case GET_ARTICLE_FAILED:
        case SAVE_ARTICLE_FAILED:
            return {...state, loading: false};
        case GET_MORE_ARTICLE_FAILED:
            return {
                ...state,
                loadingMore: false,
                hasMore: false
            };
        case RATE_ARTICLE_SUCCESS:
            const cloneData: Article[] = [...state.data];
            const index: number = cloneData.findIndex((article: Article) => article._id === action.article);
            if (index >= 0) {
                if (action.rating === 1) {
                    cloneData[index].likes.push(action.user);
                } else {
                    const toRemove: number = cloneData[index].likes.findIndex((value: string) => value === action.user);
                    cloneData[index].likes.splice(toRemove, 1);
                }
            }
            return {...state, data: cloneData};
        case SET_ARTICLE_CACHE: {
            const cloneCache: {[id: string]: ArticleCache} = {...state.cache};
            cloneCache[action.id] = action.cache;
            return {...state, cache: cloneCache};
        }
        case CLEAR_ARTICLE_CACHE: {
            const cloneCache: {[id: string]: ArticleCache} = {...state.cache};
            delete cloneCache[action.id];
            return {...state, cache: cloneCache};
        }
        default:
            return state;
    }
};

export default article;