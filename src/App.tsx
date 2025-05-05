import './App.scss';
import {appPrefix} from "@/constants";
import {Button, ConfigProvider, Empty, Layout, theme} from "antd";
import React, {useState} from "react";
import Left from "@/Left";
import Right from "@/Right.jsx";
import MainContent from "@/MainContent";
import HeaderContent from "@/HeaderContent";
import {inject, observer} from "mobx-react";
import eventEmitter from "@/utils/eventEmitter.js";
import {AppPropsType} from "./types";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {LeftOutlined, RightOutlined} from '@ant-design/icons'

const {Sider, Header, Content} = Layout;
const App: React.FC<AppPropsType> = (props) => {
    const {selectSpace, appTheme, globalLoading} = props.appStore;
    const [leftVisible, setLeftVisible] = useState(false);
    const [rightVisible, setRightVisible] = useState(false);

    const onAddSpace = () => {
        eventEmitter.emit('addSpace');
    }
    return (
        <ConfigProvider
            theme={{
                algorithm: appTheme === 'night' ? theme.darkAlgorithm : theme.defaultAlgorithm,
                components: {
                    Layout: {
                        headerBg: appTheme === 'light' ? '#fff' : '#001529'
                    },
                }
            }}
        >
            <div className={`${appPrefix} ${appPrefix}-${appTheme}`}>
                <DndProvider backend={HTML5Backend}>
                    <Layout className={`${appPrefix}-layout`}>
                        <Sider theme={appTheme} className={`${appPrefix}-layout-left-sider`}
                               zeroWidthTriggerStyle={{width: '40px'}}
                               trigger={leftVisible ? <RightOutlined/> : <LeftOutlined/>} collapsible
                               collapsedWidth={0} collapsed={leftVisible} onCollapse={(value) => setLeftVisible(value)}>
                            <Left/>
                        </Sider>
                        <Layout>
                            <Header style={{padding: 0, height: '50px'}}
                            >
                                <HeaderContent/>
                            </Header>
                            <Content style={selectSpace.length ? {} : {
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%'
                            }}>
                                {
                                    (selectSpace.length||globalLoading) ? <MainContent/> : <Empty
                                        description={
                                            <span>
                                               暂无空间，请先创建空间
                                             </span>
                                        }
                                    >
                                        <Button type={'primary'} onClick={onAddSpace}>新建工作空间</Button>
                                    </Empty>
                                }
                            </Content>
                        </Layout>
                        <Sider className={`${appPrefix}-layout-right-sider`} theme={appTheme}
                               trigger={rightVisible ? <LeftOutlined/> : <RightOutlined/>} reverseArrow collapsible
                               collapsedWidth={0} collapsed={rightVisible}
                               onCollapse={(value) => setRightVisible(value)}>
                            <Right/>
                        </Sider>
                    </Layout>
                </DndProvider>
            </div>
        </ConfigProvider>
    )
}

export default inject("appStore")(observer(App))