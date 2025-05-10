import {appPrefix} from "@/constants/index.js";
import {Button, Collapse, Input, List, Tag} from "antd";
import '@/style/right.scss';
import {ReloadOutlined} from '@ant-design/icons';
import React, {useEffect, useRef, useState} from "react";
import {RightPropsType} from "@/types";
import {useDrag} from "react-dnd";


const Right:React.FC<RightPropsType> = () => {
    const [windows, setWindows] = useState([]);
    const hasRegister = useRef(false);
    const [activeKey, setActiveKey] = useState([]);
    const [seachValue, setSearchValue] = useState('');
    const registerChromeMessage = ()=>{
        hasRegister.current = true;
        // 添加消息监听器
        chrome.runtime?.onMessage.addListener(async (message:any) => {
            const windows = await chrome?.windows.getAll({ populate: true });
            setWindows(windows.map((item:any, index)=>{
                item.content = `窗口${index+1}`
                item.tabs = item.tabs.filter(item1=>item1.url.startsWith("http")).map(item1=>{
                    item1.name = item1.name||item1.title;
                    return item1;
                })
                return item;
            }))
            return;
            switch (message.action) {
                case 'windowFocusChanged'://窗口焦点变化
                    setWindows(windows=>windows.map(item=>{
                        item.focus = item.id === message.windowId;
                        return item;
                    }))
                    break;
                case 'windowCreated'://新建窗口
                    setWindows(windows=>[
                        ...windows,
                        {
                            ...message.window,
                            content: `窗口${windows.length+1}`
                        }
                    ])
                    setActiveKey(activeKey=>[...activeKey, message.windowId])
                    break;
                case "windowRemoved"://窗口删除
                    setWindows(windows=>windows.filter(item=>item.id !== message.windowId))
                    break;
                case 'tabCreated'://标签页创建事件
                    setWindows(windows=>windows.map(item=>{
                        if(item.id===message.tab.windowId){
                            item.tabs = item.tabs||[];
                            item.tabs.push(message.tab)
                        }
                        return item;
                    }))
                    setActiveKey(activeKey=>[...activeKey, message.tab.windowId])
                    break;
                case 'tabUpdated'://标签页更新事件
                    setWindows(windows=>windows.map(item=>{
                        if(item.id===message.tab.windowId){
                            item.tabs = item.tabs.map(item1=>{
                                if(item1.id===message.tab.id){
                                    return message.tab;
                                }
                                return item1;
                            })
                        }
                        return item;
                    }))
                    break;
                case 'tabRemoved'://标签页删除事件
                    setWindows(windows=>windows.map(item=>{
                        if(item.id===message.removeInfo.windowId){
                            item.tabs = item.tabs.filter(item1=>item1.id!==message.tabId)
                        }
                        return item;
                    }))
                    break;
                case 'tabMoved':
                    break;
                default:
                    console.log('Unknown action:', message.action);
            }
        });
    }
    useEffect(() => {
        const func = async ()=>{
            const windows = await chrome?.windows.getAll({ populate: true });
            setWindows(windows.map((item:any, index)=>{
                item.content = `窗口${index+1}`
                item.tabs = item.tabs.filter(item1=>item1.url.startsWith("http"))
                return item;
            }))
            setActiveKey(windows.map(item=>item.id))
        }
        func()
    }, []);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        !hasRegister.current && registerChromeMessage?.();

    }, []);

    const onChange = (key) => {
        setActiveKey(key)
    };
    let showWindows = windows;
    if(seachValue){
        showWindows = [];
        windows.forEach(item=>{
            const tabs = item.tabs.filter(item1=>item1.title.includes(seachValue))
            if(tabs.length){
                showWindows.push({
                    ...item,
                    tabs
                })
            }
        })
    }
    const items = showWindows.map(item=>{
        return {
            key: item.id,
            label: <div>
                {item.content}
                <Button shape={'circle'} size={'small'} style={{marginLeft: 8}}>{item?.tabs?.length||0}</Button>
            </div>,
            children: <List
                dataSource={item.tabs||[]}
                split={false}
                renderItem={item => <ListItem {...item}/>}
            />,
        }
    })

    const onChangeSearch = (e)=>{
        const value = e.target.value
        setSearchValue((value||'').trim())
    }
    return (
        <div className={`${appPrefix}-right`}>
            <div className={`${appPrefix}-right-title`}>
                <div className={`${appPrefix}-right-title-text`}>打开的标签页</div>
                <div className={`${appPrefix}-right-title-add`}>
                    <Button icon={<ReloadOutlined />} title={'刷新标签页'}/>
                </div>
            </div>
            <div className={`${appPrefix}-right-content`}>
                <div className={`${appPrefix}-right-content-search`}>
                    <Input placeholder="请输入标签页名称" onChange={onChangeSearch}/>
                </div>
                <div className={`${appPrefix}-right-content-menu`}>
                    <Collapse ghost items={items} onChange={onChange} activeKey={activeKey}/>
                </div>
            </div>
        </div>
    );
};

export default Right;

const ListItem = (props)=>{
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'BOX',
        item: props,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));
    const onClick = ()=>{
        chrome.tabs.update(props.id, {active: true})
    }
    return (
        <List.Item onClick={onClick} ref={drag as any} className={`${appPrefix}-right-list-item`} style={{ opacity: isDragging ? 0.5 : 1 }}>
            <Tag icon={<img src={props.favIconUrl} style={{width: 16, height: 16}}/>}
                 className={`${appPrefix}-right-list-item-content`}>

                <span title={props.title}>{props.title}</span>
            </Tag>
        </List.Item>
    )
}