import {anyParams, AppStoreType} from "@/types";

export interface MainContentPropsType{
    appStore?: AppStoreType;
}

export interface CollectionDetailPropsType{
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    data: anyParams;
    spaceId: string;
}

export interface PageDetailPropsType{
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    data: anyParams;
    appStore?: AppStoreType;
}