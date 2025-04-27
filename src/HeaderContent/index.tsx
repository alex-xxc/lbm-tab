import {appPrefix} from "@/constants";
import "@/style/header.scss";
import {SunOutlined, SettingOutlined, MoonOutlined} from "@ant-design/icons";
import React, {useState} from "react";
import Setting from "@/HeaderContent/Setting.tsx";
import {Switch} from "antd";
import {inject, observer} from "mobx-react";
import {AppStoreType} from "@/types";
import storage from "@/storage.ts";

interface PropsType{
    appStore?: AppStoreType;
}

const Index:React.FC<PropsType> = (props) => {
    const {setProperty, appTheme} = props.appStore!;
    const [showSetting, setShowSetting] = useState(false);
    const onCloseSetting = ()=>{
        setShowSetting(false)
    }
    const onShowSetting = ()=>{
        setShowSetting(true)
    }

    const onChangeTheme = (value:boolean)=>{
        const appTheme = value?'light':'night'
        setProperty({appTheme})
        storage.set(storage.APPTHEME, appTheme)

    }
    return (
        <div className={`${appPrefix}-header`}>
            <div className={`${appPrefix}-header-left`}>
                <span className={`${appPrefix}-header-left-logo`}></span>
                <span className={`${appPrefix}-header-left-title`}>LBM-TAB</span>
            </div>
            <div className={`${appPrefix}-header-right`}>
                <div>
                    <Switch checkedChildren={<SunOutlined /> as any} unCheckedChildren={<MoonOutlined /> as any} value={appTheme==='light'} onChange={onChangeTheme}/>
                </div>
                {/*<div className={`${appPrefix}-header-right-item`}>*/}
                {/*    <ShareAltOutlined/>*/}
                {/*    <span>分享</span>*/}
                {/*</div>*/}
                {/*<div className={`${appPrefix}-header-right-item`}>*/}
                {/*    <CloudSyncOutlined />*/}
                {/*    <span>同步</span>*/}
                {/*</div>*/}
                <div className={`${appPrefix}-header-right-item`} onClick={onShowSetting}>
                    <SettingOutlined/>
                    <span>设置</span>
                </div>
            </div>
            <Setting visible={showSetting} onClose={onCloseSetting}/>
        </div>
    )
}

export default inject("appStore")(observer(Index));