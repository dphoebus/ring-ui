import React from 'react';
import PropTypes from 'prop-types';

import Popup from '../popup/popup';
import List from '../list/list';

/**
 * @name Popup Menu
 * @category Components
 * @constructor
 * @description Displays a popup menu.
 * @extends {ReactComponent}
 * @example
   <example name="Popup Menu">
     <file name="index.html" disable-auto-size>
       <div>
         <div id="popup"></div>
       </div>
     </file>

     <file name="index.js" webpack="true">
       import React from 'react';
       import {render} from 'react-dom';
       import PopupMenu from '@jetbrains/ring-ui/components/popup-menu/popup-menu';

       const data = [
          {'label': 'Item'},
          {'label': 'Link to jetbrains.com', 'href': 'http://www.jetbrains.com'},
          {'rgItemType': PopupMenu.ListProps.Type.SEPARATOR},
          {'rgItemType': PopupMenu.ListProps.Type.LINK, 'label': 'Link Item'},
          {'rgItemType': PopupMenu.ListProps.Type.LINK, 'label': 'Link Item With Additional Class', 'className': 'test'},
          {'rgItemType': PopupMenu.ListProps.Type.SEPARATOR, 'description': 'Separator With Description'},
          {'rgItemType': PopupMenu.ListProps.Type.TITLE, 'label': 'Title'},
          {'rgItemType': PopupMenu.ListProps.Type.ITEM, 'label': '1 Element in group'},
          {'rgItemType': PopupMenu.ListProps.Type.ITEM, 'label': '2 Element in group'}
       ];

       render(<PopupMenu data={data}/>, document.getElementById('popup'));
     </file>
   </example>
 */
export default class PopupMenu extends Popup {
  static isItemType = List.isItemType;
  static ListProps = List.ListProps;

  static propTypes = {
    ...Popup.propTypes,
    ...List.propTypes,
    closeOnSelect: PropTypes.bool
  };

  static defaultProps = {
    ...List.defaultProps,
    ...Popup.defaultProps,
    renderOptimization: false,
    closeOnSelect: false
  }

  onSelect = (item, event) => {
    if (this.props.closeOnSelect) {
      this._onCloseAttempt(event);
    }
    this.props.onSelect(item, event);
  };

  listRef = el => {
    this.list = el;
  };

  /** @override */
  getInternalContent() {
    // eslint-disable-next-line no-unused-vars
    const {className, ...props} = this.props;

    return (
      <div>
        <List
          ref={this.listRef}
          {...props}
          maxHeight={this.popup && this.popup.style.maxHeight}
          shortcuts={this.shortcutsEnabled()}
          onSelect={this.onSelect}
        />
      </div>
    );
  }
}
