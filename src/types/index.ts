export interface AppStoreType{
    selectSpace: string[];
    setProperty:(params:anyParams)=>void;
    appTheme: 'light'|'night';
}

export interface AppPropsType{
    appStore?: AppStoreType;
}

export interface LeftPropsType{
    appStore?: AppStoreType;
}

export interface RightPropsType{
    appStore?: AppStoreType;
}

export interface anyParams{
    [_:string]: any;
}