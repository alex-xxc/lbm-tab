import React, {useEffect, useRef, useState} from "react";
import {Button, Col, Modal, Row} from "antd";
import {appPrefix} from "@/constants";
import {UploadOutlined} from '@ant-design/icons';
import storage from "@/storage.ts";

interface SettingProps {
    visible: boolean;
    onClose: () => void;
}

const Setting: React.FC<SettingProps> = (props) => {
    const [visible, setVisible] = useState(false);
    const [labelCol] = useState(8)
    const [contentCol] = useState(16)
    const inputRef = useRef(null as HTMLInputElement);
    const onClose = () => {
        setVisible(false);
        props.onClose();
    };

    useEffect(() => {
        if(props.visible && props.visible!==visible){
            setVisible(true)
        }
    }, [visible, props.visible]);

    const onExport = async () => {
        const collectionData = await storage.get(storage.COLLECTIONDATA);
        const pageData = await storage.get(storage.PAGEDATA);
        const space = await storage.get(storage.SPACE);
        const selectSpace = await storage.get(storage.SELECTSPACE);
        const appTheme = await storage.get(storage.APPTHEME);
        // 将 JSON 数据转换为字符串
        const jsonString = JSON.stringify({
            [storage.COLLECTIONDATA]:collectionData,
            [storage.PAGEDATA]:pageData,
            [storage.SPACE]:space,
            [storage.SELECTSPACE]:selectSpace,
            [storage.APPTHEME]:appTheme
        }, null, 2);

        // 创建一个 Blob 对象
        const blob = new Blob([jsonString], { type: 'application/json' });

        // 创建一个下载链接
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lbm_tab.json'; // 设置下载文件的名称

        // 触发下载
        document.body.appendChild(a); // 将链接添加到文档中（某些浏览器需要）
        a.click();

        // 清理
        document.body.removeChild(a); // 移除链接
        URL.revokeObjectURL(url); // 释放 URL 对象
    }

    const onChangeFile = (e: any) => {
        const file = e.target.files?.[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = async function (event:any) {
            const fileContent = event.target?.result;
            try {
                const jsonObject = JSON.parse(fileContent as string);
                if(jsonObject[storage.COLLECTIONDATA]){
                    await storage.set(storage.COLLECTIONDATA, jsonObject[storage.COLLECTIONDATA])
                }
                if(jsonObject[storage.SPACE]){
                    await storage.set(storage.SPACE, jsonObject[storage.SPACE])
                }
                if(jsonObject[storage.SELECTSPACE]){
                    await storage.set(storage.SELECTSPACE, jsonObject[storage.SELECTSPACE])
                }
                if(jsonObject[storage.PAGEDATA]){
                    await storage.set(storage.PAGEDATA, jsonObject[storage.PAGEDATA])
                }
                if(jsonObject[storage.APPTHEME]){
                    await storage.set(storage.APPTHEME, jsonObject[storage.APPTHEME])
                }
                Modal.confirm({
                    title: '提示',
                    content: '导入成功，点击确认刷新页面',
                    okText: '确认',
                    cancelText: '取消',
                    onOk: async () => {
                        window.location.reload()
                    },
                });
                // 在这里可以对解析后的 JSON 对象进行进一步处理
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        };
        reader.readAsText(file,'utf-8')
    }

    const clickFile = () => {
        inputRef.current?.click?.();
    }

    return (
        <Modal
            title={`设置`}
            open={visible}
            onOk={onClose}
            onCancel={onClose}
            className={`${appPrefix}-setting`}
        >
            <div className={`${appPrefix}-setting-content`}>
                <Row>
                    <Col span={labelCol}>导入</Col>
                    <Col span={contentCol}>
                        <input type={'file'} style={{display: 'none'}} onChange={onChangeFile} ref={inputRef} accept={'.json'}/>
                        <Button icon={<UploadOutlined />} type={'primary'} onClick={clickFile}>上传json文件</Button>
                    </Col>
                </Row>
                <Row>
                    <Col span={labelCol}>导出</Col>
                    <Col span={contentCol}>
                        <Button onClick={onExport} type={'primary'}>执行</Button>
                    </Col>
                </Row>
            </div>
        </Modal>
    );
};

export default Setting;