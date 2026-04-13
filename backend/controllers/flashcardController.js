import flashcard from "../models/Flashcard";

//@desc Tải tất cả flashcard của tài liệu
// @route GET /api/flashcards/:documentId
// @access Private
export const getFlashcards = async (req, res, next) => {
    try{
        const flashcards = await Flashcard.find({
            userId: req.user._id,
            documentId: req.params.documentId
        })
        
        .populates('docunmentId', 'title fileName')
        .sort({ createAt: -1});

        res.status(200).json({
            success: true,
            count: flashcards.length,
            data: flashcards
        });

    }catch(error) {
        next(error);
    }
};

//@desc Tải tất cả bộ flashcard cho người dùng
// @route GET /api/flashcards
// @access Private
export const getAllFlashcardSets = async (req, res, next) => {
    try{
        const flashcardSets = await Flashcard.find({ userId: req.user._id})
            .populates('documentId', 'title')
            .sort({ createAt: -1 });
    
        res.status(200).json({
            success: true,
            count: flashcardSets.length,
            data: f=flashcardSets,
        });
    }catch(error) {
        next(error);
    }
};

//@desc Thẻ flashcard xem lại
// @route POST /api/flashcards/:cardId/review
// @access Private
export const reviewFlashcard = async (req, res, next) => {
    try{
        const flashcardSet = await Flashcard.findOne({
            'card.id': req.params.cardId,
            userId: req.user._id
        });

        if(!flashcardSet) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy bộ hay thẻ flashcard',
                statusCode: 404
            });
        }

        const cardIndex = flashcardSet.cards.findIndex(card => card._id.toString()=== req.params.cardId);

        if (cardIndex === -1){
            return res.status(404).json({
                success: false,
                error:'Không tìm thấy thẻ trong bộ',
                statusCode: 404
            });
        }

        //Cập nhật thông tin xem lại
        flashcardSet.card(cardIndex).lastReviewd = new Date();
        flashcardSet.card(cardIndex).reviewCout += 1;

        await flashcardSet.save();

        res.status(200).json({
            success: true,
            data: flashcardSet,
            message:'Flashcard đã được đánh dấu là đã xem lại'
        });
    }catch(error) {
        next(error);
    }
};

//@desc Chọn flashcard yêu thích/dấu sao
// @route PUT /api/flashcards/:cardId/star
// @access Private
export const toggleStarFlashcard = async (req, res, next) => {
    try{

    }catch(error) {
        next(error);
    }
};

//@desc Xóa bộ flashcard
// @route DELETE /api/flashcards/:id
// @access Private
export const deleteFlashcardSet = async (req, res, next) => {
    try{

    }catch(error) {
        next(error);
    }
};






