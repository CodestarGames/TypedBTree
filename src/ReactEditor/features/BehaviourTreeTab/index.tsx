import './behaviourTreeTab.css';
import cx from 'classnames';
import testJSON from './testTree.json'
import React, {Component} from "react";
import {Treeview} from "../../components/Treeview";


export class BehaviourTreeTab extends Component {
    state = {
        active: null,
        tree: testJSON
    };

    getNodeColorClass(node) {

        let backgroundClass = '';
        if (node.$type.indexOf('AI.Items.Actions') > -1)
            backgroundClass += 'tree-view-icon-action';

        if (node.$type.indexOf('AI.Items.Repeat') > -1)
            backgroundClass += 'tree-view-icon-repeat';

        if (node.$type.indexOf('AI.Items.Sequence') > -1)
            backgroundClass += 'tree-view-icon-sequence';

        if (node.$type.indexOf('AI.Items.Selector') > -1)
            backgroundClass += 'tree-view-icon-selector';

        if (node.$type.indexOf('AI.Items.Wait') > -1)
            backgroundClass += 'tree-view-icon-wait';

        if (node.$type.indexOf('AI.Items.Condition') > -1)
            backgroundClass += 'tree-view-icon-condition';

        if (node.$type.indexOf('AI.Items.Parallel') > -1)
            backgroundClass += 'tree-view-icon-parallel';

        if (node.$type.indexOf('AI.Items.Lotto') > -1)
            backgroundClass += 'tree-view-icon-lotto';

        if (node.$type.indexOf('AI.Items.Switch') > -1)
            backgroundClass += 'tree-view-icon-switch';
        if (node.$type.indexOf('AI.Items.Flip') > -1)
            backgroundClass += 'tree-view-icon-flip';
        return backgroundClass;
    }

    renderNode = node => {

        let inputs = Object.entries(node)
            .filter(item => item[0].indexOf('$data') > -1)
            .map((item, i) => {
                // @ts-ignore
                return <div className={'field-editor'} key={item[0]}><label>{item[0]}</label><input defaultValue={item[1]}></input></div>
        });

        // @ts-ignore
        return (
            <span
                className={cx('node', {'is-active': node === this.state.active}, this.getNodeColorClass(node))}
                onClick={this.onClickNode.bind(null, node)}
            >
                {node.$type.replace('AI.Items.', '').replace('.',"::")}
                {inputs}
                {node.hooks && node.hooks.length > 0 ? this.renderNode(node.hooks[0]) : ''}
                {node.$type.indexOf('Hooks') > -1 ? <div className={'hooks'}><span>{node.$type}</span>{this.renderNode(node.action)}</div> : ''}
            </span>
        );
    };


    onClickNode = node => {
        this.setState({
            active: node
        });
    };
    private isNodeCollapsed: any;

    render() {
        return (
            <div className="b-t-tab-treeview">
                <Treeview
                    paddingLeft={32}
                    tree={this.state.tree}
                    onChange={this.handleChange}
                    isNodeCollapsed={false}
                    renderNode={this.renderNode}
                />
            </div>
            );
    }

    handleChange = tree => {
        this.setState({
            tree: tree
        });
    };

}

