import cx from 'classnames';
import React, { Component } from 'react';

type TreeNodeProps = {
  index?: any;
  paddingLeft?: any;
  border?: string;
  background?: string;
  tree?: any;
  onCollapse?: any;
  onDragStart?: any;
  dragging?: any;
}

export class TreeviewNode extends Component<TreeNodeProps> {
  private innerRef = React.createRef<HTMLDivElement>();

  constructor(props) {
    super(props);
  }

  renderCollapse = () => {
    const { index } = this.props;

    if (index.children && index.children.length) {
      const { collapsed } = index.node;

      return (
        <span
          className={cx('collapse', collapsed ? 'caret-right' : 'caret-down')}
          onMouseDown={e => e.stopPropagation()}
          onClick={this.handleCollapse}
        />
      );
    }

    return null;
  };

  renderChildren = () => {
    const { index, tree, dragging } = this.props;

    if (index.children && index.children.length) {
      const childrenStyles = {
        paddingLeft: this.props.paddingLeft,
        border: this.props.border,
        background: this.props.background
      };

      return (
        <div className="children" style={childrenStyles}>
          {index.children.map(child => {
            const childIndex = tree.getIndex(child);

            return (
              <TreeviewNode
                tree={tree}
                index={childIndex}
                key={childIndex.id}
                dragging={dragging}
                paddingLeft={this.props.paddingLeft}
                onCollapse={this.props.onCollapse}
                onDragStart={this.props.onDragStart}
              />
            );
          })}
        </div>
      );
    }

    return null;
  };

  render() {
    const { tree, index, dragging } = this.props;
    const { node } = index;
    const styles = {};

    return (
      <div
        className={cx('m-node', {
          placeholder: index.id === dragging
        })}
        style={styles}
      >
        <div
          className="inner"
          ref={this.innerRef}
          onMouseDown={this.handleMouseDown}
        >
          {this.renderCollapse()}
          {tree.renderNode(node)}
        </div>
        {node.collapsed ? null : this.renderChildren()}
      </div>
    );
  }

  handleCollapse = e => {
    e.stopPropagation();
    const nodeId = this.props.index.id;

    if (this.props.onCollapse) {
      this.props.onCollapse(nodeId);
    }
  };

  handleMouseDown = e => {
    const nodeId = this.props.index.id;
    const dom = this.innerRef.current;

    if (this.props.onDragStart) {
      this.props.onDragStart(nodeId, dom, e);
    }
  };
}
